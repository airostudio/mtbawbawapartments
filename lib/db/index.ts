/**
 * PostgreSQL connection pool
 *
 * Design decisions:
 *  - SSL enabled only when DATABASE_URL contains "sslmode=require" or we are
 *    connecting to a non-localhost host.  This lets the same codebase work
 *    for local dev (no SSL) and Supabase/Vercel (SSL required).
 *  - Pool size is kept small (max 3) — Supabase free tier allows 60 direct
 *    connections, and Vercel serverless functions each get their own pool, so
 *    a large per-function pool wastes connections.
 *  - Connection and idle timeouts set conservatively so stale connections
 *    are cleaned up quickly in a serverless environment.
 *  - The singleton pattern (globalThis) prevents hot-reload in Next.js dev
 *    from opening a new pool on every request.
 */

import pg from 'pg';

// ── Type parsers ─────────────────────────────────────────────────────────────
// pg returns INT8, FLOAT4, FLOAT8, NUMERIC as strings to avoid JS precision
// loss.  Our monetary values are safe as numbers, so parse them.
pg.types.setTypeParser(20,   (v: string) => parseInt(v, 10));   // INT8  / BIGINT
pg.types.setTypeParser(700,  (v: string) => parseFloat(v));      // FLOAT4
pg.types.setTypeParser(701,  (v: string) => parseFloat(v));      // FLOAT8
pg.types.setTypeParser(1700, (v: string) => parseFloat(v));      // NUMERIC

// ── SSL detection ────────────────────────────────────────────────────────────
function needsSsl(connectionString: string | undefined): boolean {
  if (!connectionString) return false;
  if (connectionString.includes('sslmode=require')) return true;
  if (connectionString.includes('sslmode=disable'))  return false;
  // Non-localhost hosts (Supabase, RDS, etc.) almost always need SSL
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1') ||
    connectionString.includes('::1');
  return !isLocal;
}

// ── Singleton pool ───────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('[db] DATABASE_URL is not set — all queries will fail gracefully.');
  }

  const ssl = needsSsl(connectionString)
    ? { rejectUnauthorized: false }   // Supabase pooler uses self-signed certs
    : false;

  return new pg.Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl,
  });
}

export const pool: pg.Pool =
  globalThis.__pgPool ?? (globalThis.__pgPool = createPool());

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Run a parameterised query and return all rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/** Run a parameterised query and return the first row (or null). */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Run multiple queries inside a single transaction.
 * Automatically rolls back on error.
 */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Generate a UUID v4 used as primary key for new rows. */
export function generateId(): string {
  return crypto.randomUUID();
}

export type { Pool, PoolClient } from 'pg';
export * from './types';
