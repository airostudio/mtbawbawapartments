/**
 * Typed environment variable access.
 *
 * All vars are read at module evaluation time.  Missing required vars are
 * caught by validateEnv(), which is called from instrumentation.ts (or can be
 * called manually in API routes that need a specific var).
 */

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL ?? '',

  // Stripe
  STRIPE_SECRET_KEY:      process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
  STRIPE_WEBHOOK_SECRET:  process.env.STRIPE_WEBHOOK_SECRET ?? '',

  // App
  NEXT_PUBLIC_APP_URL:   process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Mt Baw Baw Apartments',

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? '',

  // Email
  SMTP_HOST:     process.env.SMTP_HOST ?? '',
  SMTP_PORT:     parseInt(process.env.SMTP_PORT ?? '587', 10),
  SMTP_USER:     process.env.SMTP_USER ?? '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? '',
  SMTP_FROM:     process.env.SMTP_FROM ?? '',

  // Slack
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL ?? '',

  // Configuration
  PRICE_LOCK_DURATION:      parseInt(process.env.PRICE_LOCK_DURATION ?? '10', 10),
  DEFAULT_MARKUP_PERCENT:   parseFloat(process.env.DEFAULT_MARKUP_PERCENT ?? '20'),
  AVAILABILITY_CACHE_TTL:   parseInt(process.env.AVAILABILITY_CACHE_TTL ?? '15', 10),
} as const;

/**
 * Assert that required environment variables are present.
 * Call this at the top of any API route that genuinely cannot function
 * without them (e.g. checkout requires Stripe keys).
 *
 * For the homepage and property listing we do NOT call this — we want
 * the page to render (with a graceful empty state) even when the DB is down.
 */
export function requireEnv(...keys: (keyof typeof env)[]): void {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}.\n` +
      'Copy .env.example to .env.local and fill in the values, or set them in your Vercel project settings.',
    );
  }
}
