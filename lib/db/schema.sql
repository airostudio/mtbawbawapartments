-- ============================================================
-- Mt Baw Baw Apartments — PostgreSQL schema
-- This is a reference copy of the schema that Prisma originally
-- created.  Table/column names use double-quoted camelCase to
-- match the existing Prisma-generated tables in Supabase.
--
-- Run against a fresh database if you ever need to recreate
-- from scratch:  psql "$DATABASE_URL" -f schema.sql
-- ============================================================

-- Property ---------------------------------------------------
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
  "operatorId"         TEXT REFERENCES "Operator"("id"),
  "operatorName"       TEXT NOT NULL,
  "operatorContact"    TEXT NOT NULL,
  "operatorEmail"      TEXT,
  "operatorBookingUrl" TEXT,
  "connectorType"      TEXT NOT NULL,
  "connectorConfig"    JSONB,
  "markupPercent"      DOUBLE PRECISION NOT NULL DEFAULT 20.0,
  "seasonalMarkup"     JSONB,
  "active"             BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Property_slug_idx"       ON "Property" ("slug");
CREATE INDEX IF NOT EXISTS "Property_active_idx"     ON "Property" ("active");
CREATE INDEX IF NOT EXISTS "Property_operatorId_idx" ON "Property" ("operatorId");

-- Booking ----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Booking" (
  "id"                    TEXT PRIMARY KEY,
  "propertyId"            TEXT NOT NULL REFERENCES "Property"("id"),
  "checkIn"               TIMESTAMP(3) NOT NULL,
  "checkOut"              TIMESTAMP(3) NOT NULL,
  "nights"                INTEGER NOT NULL,
  "guestName"             TEXT NOT NULL,
  "guestEmail"            TEXT NOT NULL,
  "guestPhone"            TEXT NOT NULL,
  "numberOfGuests"        INTEGER NOT NULL,
  "basePricePerNight"     DOUBLE PRECISION NOT NULL,
  "markupPercent"         DOUBLE PRECISION NOT NULL,
  "totalBasePrice"        DOUBLE PRECISION NOT NULL,
  "totalMarkup"           DOUBLE PRECISION NOT NULL,
  "totalPrice"            DOUBLE PRECISION NOT NULL,
  "stripeFee"             DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netProfit"             DOUBLE PRECISION NOT NULL,
  "stripePaymentIntent"   TEXT UNIQUE,
  "stripeSessionId"       TEXT,
  "paymentStatus"         TEXT NOT NULL DEFAULT 'pending',
  "stripeTransferId"      TEXT UNIQUE,
  "stripeTransferStatus"  TEXT,
  "platformFeeAmount"     DOUBLE PRECISION,
  "status"                TEXT NOT NULL DEFAULT 'pending',
  "operatorConfirmation"  TEXT,
  "operatorPaid"          BOOLEAN NOT NULL DEFAULT FALSE,
  "operatorPaidAt"        TIMESTAMP(3),
  "operatorPaidAmount"    DOUBLE PRECISION,
  "alertsSent"            BOOLEAN NOT NULL DEFAULT FALSE,
  "notes"                 TEXT,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Booking_propertyId_idx"          ON "Booking" ("propertyId");
CREATE INDEX IF NOT EXISTS "Booking_status_idx"              ON "Booking" ("status");
CREATE INDEX IF NOT EXISTS "Booking_paymentStatus_idx"       ON "Booking" ("paymentStatus");
CREATE INDEX IF NOT EXISTS "Booking_checkIn_idx"             ON "Booking" ("checkIn");
CREATE INDEX IF NOT EXISTS "Booking_guestEmail_idx"          ON "Booking" ("guestEmail");
CREATE INDEX IF NOT EXISTS "Booking_stripeTransferStatus_idx" ON "Booking" ("stripeTransferStatus");

-- AvailabilityCache ------------------------------------------
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

-- User -------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
  "id"        TEXT PRIMARY KEY,
  "email"     TEXT NOT NULL UNIQUE,
  "name"      TEXT,
  "role"      TEXT NOT NULL DEFAULT 'admin',
  "password"  TEXT NOT NULL,
  "active"    BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User" ("email");

-- SystemConfig -----------------------------------------------
CREATE TABLE IF NOT EXISTS "SystemConfig" (
  "id"        TEXT PRIMARY KEY,
  "key"       TEXT NOT NULL UNIQUE,
  "value"     JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "SystemConfig_key_idx" ON "SystemConfig" ("key");

-- Operator ---------------------------------------------------
CREATE TABLE IF NOT EXISTS "Operator" (
  "id"                       TEXT PRIMARY KEY,
  "name"                     TEXT NOT NULL,
  "email"                    TEXT NOT NULL UNIQUE,
  "phone"                    TEXT,
  "businessName"             TEXT,
  "stripeAccountId"          TEXT UNIQUE,
  "stripeAccountStatus"      TEXT NOT NULL DEFAULT 'not_created',
  "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT FALSE,
  "stripeDetailsSubmitted"   BOOLEAN NOT NULL DEFAULT FALSE,
  "stripeChargesEnabled"     BOOLEAN NOT NULL DEFAULT FALSE,
  "stripePayoutsEnabled"     BOOLEAN NOT NULL DEFAULT FALSE,
  "payoutMode"               TEXT NOT NULL DEFAULT 'manual',
  "payoutSchedule"           TEXT,
  "minimumPayout"            DOUBLE PRECISION,
  "bookingUrl"               TEXT,
  "preferredContact"         TEXT,
  "active"                   BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"                TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"                TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Operator_email_idx"               ON "Operator" ("email");
CREATE INDEX IF NOT EXISTS "Operator_stripeAccountId_idx"     ON "Operator" ("stripeAccountId");
CREATE INDEX IF NOT EXISTS "Operator_stripeAccountStatus_idx" ON "Operator" ("stripeAccountStatus");

-- Payout -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "Payout" (
  "id"               TEXT PRIMARY KEY,
  "operatorId"       TEXT NOT NULL REFERENCES "Operator"("id"),
  "amount"           DOUBLE PRECISION NOT NULL,
  "currency"         TEXT NOT NULL DEFAULT 'aud',
  "stripeTransferId" TEXT UNIQUE,
  "stripePayoutId"   TEXT,
  "status"           TEXT NOT NULL DEFAULT 'pending',
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
