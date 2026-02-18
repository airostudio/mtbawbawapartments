-- ============================================================
-- Mt Baw Baw Apartments — PostgreSQL schema
-- ============================================================
-- Safe to run on both a fresh database AND the existing Supabase
-- instance — every statement uses IF NOT EXISTS / OR REPLACE.
--
-- Creation order matters (foreign-key dependencies):
--   1. Operator        (no deps)
--   2. User            (no deps)
--   3. SystemConfig    (no deps)
--   4. Property        (→ Operator)
--   5. Booking         (→ Property)
--   6. AvailabilityCache (→ Property)
--   7. Payout          (→ Operator)
--
-- Column names use the exact camelCase that Prisma created them
-- with, so all existing rows survive unchanged.
-- ============================================================


-- ── Shared helper ───────────────────────────────────────────
-- Auto-set updatedAt to NOW() on every UPDATE.
-- Called by each table's trigger below.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── 1. Operator ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Operator" (
  "id"                       TEXT PRIMARY KEY,
  "name"                     TEXT NOT NULL,
  "email"                    TEXT NOT NULL UNIQUE,
  "phone"                    TEXT,
  "businessName"             TEXT,

  -- Stripe Connect
  "stripeAccountId"          TEXT UNIQUE,
  "stripeAccountStatus"      TEXT NOT NULL DEFAULT 'not_created',
  "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT FALSE,
  "stripeDetailsSubmitted"   BOOLEAN NOT NULL DEFAULT FALSE,
  "stripeChargesEnabled"     BOOLEAN NOT NULL DEFAULT FALSE,
  "stripePayoutsEnabled"     BOOLEAN NOT NULL DEFAULT FALSE,

  -- Payout preferences
  "payoutMode"               TEXT NOT NULL DEFAULT 'manual',
  "payoutSchedule"           TEXT,
  "minimumPayout"            DOUBLE PRECISION,

  -- Contact
  "bookingUrl"               TEXT,
  "preferredContact"         TEXT,

  "active"                   BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"                TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"                TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Operator_email_idx"               ON "Operator" ("email");
CREATE INDEX IF NOT EXISTS "Operator_stripeAccountId_idx"     ON "Operator" ("stripeAccountId");
CREATE INDEX IF NOT EXISTS "Operator_stripeAccountStatus_idx" ON "Operator" ("stripeAccountStatus");

CREATE OR REPLACE TRIGGER "Operator_set_updated_at"
  BEFORE UPDATE ON "Operator"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 2. User ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
  "id"        TEXT PRIMARY KEY,
  "email"     TEXT NOT NULL UNIQUE,
  "name"      TEXT,
  "role"      TEXT NOT NULL DEFAULT 'admin',  -- admin | operator
  "password"  TEXT NOT NULL,                  -- bcrypt hash
  "active"    BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User" ("email");

CREATE OR REPLACE TRIGGER "User_set_updated_at"
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 3. SystemConfig ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SystemConfig" (
  "id"        TEXT PRIMARY KEY,
  "key"       TEXT NOT NULL UNIQUE,
  "value"     JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "SystemConfig_key_idx" ON "SystemConfig" ("key");

CREATE OR REPLACE TRIGGER "SystemConfig_set_updated_at"
  BEFORE UPDATE ON "SystemConfig"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 4. Property ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Property" (
  "id"                 TEXT PRIMARY KEY,
  "name"               TEXT NOT NULL,
  "slug"               TEXT NOT NULL UNIQUE,
  "description"        TEXT NOT NULL,
  "sleeps"             INTEGER NOT NULL,
  "bedrooms"           INTEGER NOT NULL,
  "bathrooms"          INTEGER NOT NULL,
  "features"           TEXT[] NOT NULL DEFAULT '{}',
  "images"             TEXT[] NOT NULL DEFAULT '{}',
  "basePrice"          DOUBLE PRECISION NOT NULL,

  -- Operator FK (nullable — property may not be assigned yet)
  "operatorId"         TEXT REFERENCES "Operator"("id"),

  -- Legacy operator fields (kept for backward compat)
  "operatorName"       TEXT NOT NULL DEFAULT '',
  "operatorContact"    TEXT NOT NULL DEFAULT '',
  "operatorEmail"      TEXT,
  "operatorBookingUrl" TEXT,

  -- Connector integration
  "connectorType"      TEXT NOT NULL DEFAULT 'manual',
  "connectorConfig"    JSONB,

  -- Pricing
  "markupPercent"      DOUBLE PRECISION NOT NULL DEFAULT 20.0,
  -- seasonalMarkup JSON shape:
  -- { "seasons": [
  --     { "name": "Ski Season", "markup": 35,
  --       "startMonth": 6, "startDay": 1, "endMonth": 8, "endDay": 31 },
  --     { "name": "Christmas/NYE", "markup": 40,
  --       "startMonth": 12, "startDay": 20, "endMonth": 1, "endDay": 10 }
  --   ] }
  "seasonalMarkup"     JSONB,

  "active"             BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Property_slug_idx"       ON "Property" ("slug");
CREATE INDEX IF NOT EXISTS "Property_active_idx"     ON "Property" ("active");
CREATE INDEX IF NOT EXISTS "Property_operatorId_idx" ON "Property" ("operatorId");

CREATE OR REPLACE TRIGGER "Property_set_updated_at"
  BEFORE UPDATE ON "Property"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 5. Booking ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Booking" (
  "id"                    TEXT PRIMARY KEY,
  "propertyId"            TEXT NOT NULL REFERENCES "Property"("id"),

  -- Stay dates
  "checkIn"               TIMESTAMP(3) NOT NULL,
  "checkOut"              TIMESTAMP(3) NOT NULL,
  "nights"                INTEGER NOT NULL,

  -- Guest
  "guestName"             TEXT NOT NULL,
  "guestEmail"            TEXT NOT NULL,
  "guestPhone"            TEXT NOT NULL,
  "numberOfGuests"        INTEGER NOT NULL,

  -- Pricing breakdown
  "basePricePerNight"     DOUBLE PRECISION NOT NULL,
  "markupPercent"         DOUBLE PRECISION NOT NULL,
  "totalBasePrice"        DOUBLE PRECISION NOT NULL,
  "totalMarkup"           DOUBLE PRECISION NOT NULL,
  "totalPrice"            DOUBLE PRECISION NOT NULL,  -- what guest pays
  "stripeFee"             DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netProfit"             DOUBLE PRECISION NOT NULL,

  -- Payment / Stripe
  "stripePaymentIntent"   TEXT UNIQUE,
  "stripeSessionId"       TEXT,
  "paymentStatus"         TEXT NOT NULL DEFAULT 'pending',  -- pending | succeeded | failed | refunded

  -- Stripe Connect (operator payout)
  "stripeTransferId"      TEXT UNIQUE,
  "stripeTransferStatus"  TEXT,
  "platformFeeAmount"     DOUBLE PRECISION,

  -- Booking lifecycle
  "status"                TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | cancelled
  "operatorConfirmation"  TEXT,

  -- Operator payout tracking
  "operatorPaid"          BOOLEAN NOT NULL DEFAULT FALSE,
  "operatorPaidAt"        TIMESTAMP(3),
  "operatorPaidAmount"    DOUBLE PRECISION,

  -- Metadata
  "alertsSent"            BOOLEAN NOT NULL DEFAULT FALSE,
  "notes"                 TEXT,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Booking_propertyId_idx"           ON "Booking" ("propertyId");
CREATE INDEX IF NOT EXISTS "Booking_status_idx"               ON "Booking" ("status");
CREATE INDEX IF NOT EXISTS "Booking_paymentStatus_idx"        ON "Booking" ("paymentStatus");
CREATE INDEX IF NOT EXISTS "Booking_checkIn_idx"              ON "Booking" ("checkIn");
CREATE INDEX IF NOT EXISTS "Booking_guestEmail_idx"           ON "Booking" ("guestEmail");
CREATE INDEX IF NOT EXISTS "Booking_stripeTransferStatus_idx" ON "Booking" ("stripeTransferStatus");

CREATE OR REPLACE TRIGGER "Booking_set_updated_at"
  BEFORE UPDATE ON "Booking"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 6. AvailabilityCache ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AvailabilityCache" (
  "id"         TEXT PRIMARY KEY,
  "propertyId" TEXT NOT NULL REFERENCES "Property"("id"),
  "date"       DATE NOT NULL,
  "available"  BOOLEAN NOT NULL,
  "price"      DOUBLE PRECISION,
  "lastFetch"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),

  UNIQUE ("propertyId", "date")
);

CREATE INDEX IF NOT EXISTS "AvailabilityCache_propertyId_date_idx" ON "AvailabilityCache" ("propertyId", "date");
CREATE INDEX IF NOT EXISTS "AvailabilityCache_lastFetch_idx"       ON "AvailabilityCache" ("lastFetch");

-- No updatedAt column — lastFetch serves that purpose.


-- ── 7. Payout ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Payout" (
  "id"               TEXT PRIMARY KEY,
  "operatorId"       TEXT NOT NULL REFERENCES "Operator"("id"),

  "amount"           DOUBLE PRECISION NOT NULL,
  "currency"         TEXT NOT NULL DEFAULT 'aud',

  -- Stripe
  "stripeTransferId" TEXT UNIQUE,
  "stripePayoutId"   TEXT,
  "status"           TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | succeeded | failed | cancelled

  -- Booking IDs included in this payout
  "bookingIds"       TEXT[] NOT NULL DEFAULT '{}',

  "periodStart"      TIMESTAMP(3) NOT NULL,
  "periodEnd"        TIMESTAMP(3) NOT NULL,

  "failureReason"    TEXT,
  "paidAt"           TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Payout_operatorId_idx" ON "Payout" ("operatorId");
CREATE INDEX IF NOT EXISTS "Payout_status_idx"     ON "Payout" ("status");
CREATE INDEX IF NOT EXISTS "Payout_paidAt_idx"     ON "Payout" ("paidAt");
CREATE INDEX IF NOT EXISTS "Payout_createdAt_idx"  ON "Payout" ("createdAt");

CREATE OR REPLACE TRIGGER "Payout_set_updated_at"
  BEFORE UPDATE ON "Payout"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── Done ────────────────────────────────────────────────────
-- Verify with:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   ORDER BY table_name;
