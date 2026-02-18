/**
 * PostgreSQL connection pool — replaces Prisma.
 *
 * Uses node-postgres (pg) with the same DATABASE_URL that Prisma used.
 * The existing tables were created by Prisma and use double-quoted
 * camelCase identifiers ("Property", "checkIn", etc.).
 */

import pg from 'pg';

// ── Type parsers ────────────────────────────────────────────────
// pg returns FLOAT8 and NUMERIC as strings by default to avoid
// precision loss.  Our prices are safe as JS numbers, so parse them.
pg.types.setTypeParser(20, (v: string) => parseInt(v, 10));   // INT8
pg.types.setTypeParser(700, (v: string) => parseFloat(v));     // FLOAT4
pg.types.setTypeParser(701, (v: string) => parseFloat(v));     // FLOAT8
pg.types.setTypeParser(1700, (v: string) => parseFloat(v));    // NUMERIC

// ── Singleton pool ──────────────────────────────────────────────
const globalForDb = globalThis as unknown as { pool: pg.Pool | undefined };

export const pool =
  globalForDb.pool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// ── Query helpers ───────────────────────────────────────────────

/** Run a parameterised query and return all rows. */
export async function query<T = Record<string, any>>(
  text: string,
  params?: any[],
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/** Run a parameterised query and return the first row (or null). */
export async function queryOne<T = Record<string, any>>(
  text: string,
  params?: any[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Generate a new ID (UUID v4). Compatible with existing CUID text columns. */
export function generateId(): string {
  return crypto.randomUUID();
}

// Re-export types for convenience
export type { Pool } from 'pg';
export * from './types';
