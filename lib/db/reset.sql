-- ============================================================
-- Mt Baw Baw Apartments — FULL DATABASE RESET + SEED
-- ============================================================
-- WARNING: This drops and recreates ALL tables and ALL data.
-- Run this once against a fresh (or broken) Supabase database.
--
-- Required Supabase extension (enabled by default in all projects):
--   pgcrypto — used to bcrypt the admin password inline.
--
-- How to run:
--   Supabase Dashboard → SQL Editor → paste this file → Run
-- ============================================================


-- ── 0. Extensions ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ── 1. Drop everything (reverse FK order) ───────────────────
DROP TABLE IF EXISTS "Payout"            CASCADE;
DROP TABLE IF EXISTS "AvailabilityCache" CASCADE;
DROP TABLE IF EXISTS "Booking"           CASCADE;
DROP TABLE IF EXISTS "Property"          CASCADE;
DROP TABLE IF EXISTS "SystemConfig"      CASCADE;
DROP TABLE IF EXISTS "User"              CASCADE;
DROP TABLE IF EXISTS "Operator"          CASCADE;

-- Prisma migrations table (no longer needed)
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Trigger helper function
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;


-- ── 2. Helper function ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── 3. Operator ─────────────────────────────────────────────
CREATE TABLE "Operator" (
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

CREATE INDEX "Operator_email_idx"               ON "Operator" ("email");
CREATE INDEX "Operator_stripeAccountId_idx"     ON "Operator" ("stripeAccountId");
CREATE INDEX "Operator_stripeAccountStatus_idx" ON "Operator" ("stripeAccountStatus");

CREATE TRIGGER "Operator_set_updated_at"
  BEFORE UPDATE ON "Operator"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 4. User ─────────────────────────────────────────────────
CREATE TABLE "User" (
  "id"        TEXT PRIMARY KEY,
  "email"     TEXT NOT NULL UNIQUE,
  "name"      TEXT,
  "role"      TEXT NOT NULL DEFAULT 'admin',
  "password"  TEXT NOT NULL,
  "active"    BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX "User_email_idx" ON "User" ("email");

CREATE TRIGGER "User_set_updated_at"
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 5. SystemConfig ─────────────────────────────────────────
CREATE TABLE "SystemConfig" (
  "id"        TEXT PRIMARY KEY,
  "key"       TEXT NOT NULL UNIQUE,
  "value"     JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig" ("key");

CREATE TRIGGER "SystemConfig_set_updated_at"
  BEFORE UPDATE ON "SystemConfig"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 6. Property ─────────────────────────────────────────────
CREATE TABLE "Property" (
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
  "operatorName"       TEXT NOT NULL DEFAULT '',
  "operatorContact"    TEXT NOT NULL DEFAULT '',
  "operatorEmail"      TEXT,
  "operatorBookingUrl" TEXT,
  "connectorType"      TEXT NOT NULL DEFAULT 'manual',
  "connectorConfig"    JSONB,
  "markupPercent"      DOUBLE PRECISION NOT NULL DEFAULT 20.0,
  "seasonalMarkup"     JSONB,
  "active"             BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX "Property_slug_idx"       ON "Property" ("slug");
CREATE INDEX "Property_active_idx"     ON "Property" ("active");
CREATE INDEX "Property_operatorId_idx" ON "Property" ("operatorId");

CREATE TRIGGER "Property_set_updated_at"
  BEFORE UPDATE ON "Property"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 7. Booking ──────────────────────────────────────────────
CREATE TABLE "Booking" (
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

CREATE INDEX "Booking_propertyId_idx"           ON "Booking" ("propertyId");
CREATE INDEX "Booking_status_idx"               ON "Booking" ("status");
CREATE INDEX "Booking_paymentStatus_idx"        ON "Booking" ("paymentStatus");
CREATE INDEX "Booking_checkIn_idx"              ON "Booking" ("checkIn");
CREATE INDEX "Booking_guestEmail_idx"           ON "Booking" ("guestEmail");
CREATE INDEX "Booking_stripeTransferStatus_idx" ON "Booking" ("stripeTransferStatus");

CREATE TRIGGER "Booking_set_updated_at"
  BEFORE UPDATE ON "Booking"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 8. AvailabilityCache ────────────────────────────────────
CREATE TABLE "AvailabilityCache" (
  "id"         TEXT PRIMARY KEY,
  "propertyId" TEXT NOT NULL REFERENCES "Property"("id"),
  "date"       DATE NOT NULL,
  "available"  BOOLEAN NOT NULL,
  "price"      DOUBLE PRECISION,
  "lastFetch"  TIMESTAMP(3) NOT NULL DEFAULT NOW(),

  UNIQUE ("propertyId", "date")
);

CREATE INDEX "AvailabilityCache_propertyId_date_idx" ON "AvailabilityCache" ("propertyId", "date");
CREATE INDEX "AvailabilityCache_lastFetch_idx"       ON "AvailabilityCache" ("lastFetch");


-- ── 9. Payout ───────────────────────────────────────────────
CREATE TABLE "Payout" (
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

CREATE INDEX "Payout_operatorId_idx" ON "Payout" ("operatorId");
CREATE INDEX "Payout_status_idx"     ON "Payout" ("status");
CREATE INDEX "Payout_paidAt_idx"     ON "Payout" ("paidAt");
CREATE INDEX "Payout_createdAt_idx"  ON "Payout" ("createdAt");

CREATE TRIGGER "Payout_set_updated_at"
  BEFORE UPDATE ON "Payout"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════


-- ── Operators ───────────────────────────────────────────────
INSERT INTO "Operator" (
  "id", "name", "email", "phone", "businessName",
  "payoutMode", "preferredContact", "active"
) VALUES
  (
    'op-bawbaw-properties',
    'James Whitfield',
    'james@bawbawproperties.com.au',
    '+61 3 5165 1234',
    'Baw Baw Properties Pty Ltd',
    'manual',
    'email',
    TRUE
  ),
  (
    'op-alpine-stay',
    'Sarah Nguyen',
    'sarah@alpinestay.com.au',
    '+61 3 5165 5678',
    'Alpine Stay Management',
    'manual',
    'email',
    TRUE
  );


-- ── Admin user ──────────────────────────────────────────────
-- Default password: admin123  (change this immediately after install)
-- Password is bcrypt-hashed inline using pgcrypto (built into Supabase).
INSERT INTO "User" (
  "id", "email", "name", "role", "password", "active"
) VALUES (
  'user-admin-001',
  'admin@mtbawbawapartments.com',
  'Site Admin',
  'admin',
  crypt('admin123', gen_salt('bf', 10)),
  TRUE
);


-- ── System config ────────────────────────────────────────────
INSERT INTO "SystemConfig" ("id", "key", "value") VALUES
  ('cfg-markup',    'default_markup_percent', '20'),
  ('cfg-price-lock','price_lock_duration',    '10'),
  ('cfg-cache-ttl', 'availability_cache_ttl', '15'),
  ('cfg-currency',  'currency',               '"AUD"'),
  ('cfg-min-stay',  'minimum_stay_nights',    '1');


-- ── Properties ───────────────────────────────────────────────
-- Seasonal markup: ski season (June–Aug) +35%, Christmas/NYE +40%
-- Images are placeholder Unsplash URLs — replace with real photos.

INSERT INTO "Property" (
  "id", "name", "slug", "description",
  "sleeps", "bedrooms", "bathrooms",
  "features", "images",
  "basePrice", "markupPercent", "seasonalMarkup",
  "operatorId", "operatorName", "operatorContact", "operatorEmail",
  "connectorType", "active"
) VALUES

-- 1. Summit Retreat (3 bed)
(
  'prop-summit-retreat',
  'The Summit Retreat',
  'the-summit-retreat',
  'A stunning three-bedroom alpine apartment perched at the highest point of the resort with panoramic views across the Victorian snowfields. Fully equipped kitchen, log fireplace, ski-in access and a private deck make this the perfect family or group getaway year-round.',
  6, 3, 2,
  ARRAY[
    'Ski-in / Ski-out',
    'Log fireplace',
    'Full kitchen',
    'Private deck',
    'Mountain views',
    'Free Wi-Fi',
    'Smart TV',
    'Dishwasher',
    'Washing machine',
    'Ski storage',
    'BBQ'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
  ],
  350.00,
  20.0,
  '{"seasons":[
      {"name":"Ski Season","markup":35,"startMonth":6,"startDay":1,"endMonth":8,"endDay":31},
      {"name":"Christmas \/ NYE","markup":40,"startMonth":12,"startDay":20,"endMonth":1,"endDay":10}
   ]}',
  'op-bawbaw-properties',
  'Baw Baw Properties Pty Ltd',
  '+61 3 5165 1234',
  'james@bawbawproperties.com.au',
  'manual',
  TRUE
),

-- 2. Snowgum Lodge (2 bed)
(
  'prop-snowgum-lodge',
  'Snowgum Lodge',
  'snowgum-lodge',
  'Cosy two-bedroom apartment nestled among the snowgum trees with direct views of the main ski run. Light-filled open plan living area, gas fireplace and a spacious deck with an outdoor hot tub. Perfect for couples or small families looking for a relaxing mountain escape.',
  4, 2, 1,
  ARRAY[
    'Outdoor hot tub',
    'Gas fireplace',
    'Ski run views',
    'Open plan living',
    'Full kitchen',
    'Private deck',
    'Free Wi-Fi',
    'Smart TV',
    'Dishwasher',
    'Ski storage'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=1200',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
  ],
  250.00,
  20.0,
  '{"seasons":[
      {"name":"Ski Season","markup":35,"startMonth":6,"startDay":1,"endMonth":8,"endDay":31},
      {"name":"Christmas \/ NYE","markup":40,"startMonth":12,"startDay":20,"endMonth":1,"endDay":10}
   ]}',
  'op-bawbaw-properties',
  'Baw Baw Properties Pty Ltd',
  '+61 3 5165 1234',
  'james@bawbawproperties.com.au',
  'manual',
  TRUE
),

-- 3. Alpine Haven Studio (1 bed)
(
  'prop-alpine-haven-studio',
  'Alpine Haven Studio',
  'alpine-haven-studio',
  'A charming alpine studio perfect for couples or solo travellers. Modern, well-appointed and ideally located steps from the village centre and ski lifts. Features a queen bed, pull-out sofa, fully equipped kitchenette and a private balcony with treetop views.',
  2, 1, 1,
  ARRAY[
    'Steps from ski lifts',
    'Private balcony',
    'Kitchenette',
    'Queen bed',
    'Electric fireplace',
    'Free Wi-Fi',
    'Smart TV',
    'Ski storage',
    'Village views'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'
  ],
  180.00,
  20.0,
  '{"seasons":[
      {"name":"Ski Season","markup":35,"startMonth":6,"startDay":1,"endMonth":8,"endDay":31},
      {"name":"Christmas \/ NYE","markup":40,"startMonth":12,"startDay":20,"endMonth":1,"endDay":10}
   ]}',
  'op-alpine-stay',
  'Alpine Stay Management',
  '+61 3 5165 5678',
  'sarah@alpinestay.com.au',
  'manual',
  TRUE
),

-- 4. Powder Ridge Apartment (2 bed)
(
  'prop-powder-ridge',
  'Powder Ridge Apartment',
  'powder-ridge-apartment',
  'Spacious two-bedroom, two-bathroom apartment with a dedicated ski boot room and direct slope access. The open plan kitchen and living area flows out onto a wraparound deck, perfect for après-ski. Sleeps up to five with the sofa bed, making it ideal for groups.',
  5, 2, 2,
  ARRAY[
    'Ski-in / Ski-out',
    'Ski boot room',
    'Wraparound deck',
    'Full kitchen',
    'Two bathrooms',
    'Free Wi-Fi',
    'Smart TV',
    'Dishwasher',
    'Washing machine',
    'Ski storage',
    'Parking'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800'
  ],
  290.00,
  20.0,
  '{"seasons":[
      {"name":"Ski Season","markup":35,"startMonth":6,"startDay":1,"endMonth":8,"endDay":31},
      {"name":"Christmas \/ NYE","markup":40,"startMonth":12,"startDay":20,"endMonth":1,"endDay":10}
   ]}',
  'op-alpine-stay',
  'Alpine Stay Management',
  '+61 3 5165 5678',
  'sarah@alpinestay.com.au',
  'manual',
  TRUE
),

-- 5. The Chalet — Mountain View (4 bed)
(
  'prop-the-chalet',
  'The Chalet — Mountain View',
  'the-chalet-mountain-view',
  'Our largest and most luxurious offering — a four-bedroom alpine chalet with sweeping 180° mountain views. Two full bathrooms plus a powder room, a gourmet kitchen with stone benchtops, billiard room, floor-to-ceiling windows and a massive wrap-around deck with an outdoor spa. The ultimate mountain retreat for larger groups or special celebrations.',
  8, 4, 2,
  ARRAY[
    '180° mountain views',
    'Outdoor spa',
    'Gourmet kitchen',
    'Billiard room',
    'Ski-in / Ski-out',
    'Private garage',
    'Log fireplace',
    'Free Wi-Fi',
    'Smart TV (x4)',
    'Dishwasher',
    'Washing machine & dryer',
    'Ski storage room',
    'BBQ',
    'Board games'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
    'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=800',
    'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=800'
  ],
  450.00,
  20.0,
  '{"seasons":[
      {"name":"Ski Season","markup":35,"startMonth":6,"startDay":1,"endMonth":8,"endDay":31},
      {"name":"Christmas \/ NYE","markup":40,"startMonth":12,"startDay":20,"endMonth":1,"endDay":10}
   ]}',
  'op-bawbaw-properties',
  'Baw Baw Properties Pty Ltd',
  '+61 3 5165 1234',
  'james@bawbawproperties.com.au',
  'manual',
  TRUE
);


-- ── Verify ──────────────────────────────────────────────────
SELECT
  t.table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS columns,
  CASE t.table_name
    WHEN 'Operator'          THEN (SELECT COUNT(*)::text FROM "Operator")
    WHEN 'User'              THEN (SELECT COUNT(*)::text FROM "User")
    WHEN 'SystemConfig'      THEN (SELECT COUNT(*)::text FROM "SystemConfig")
    WHEN 'Property'          THEN (SELECT COUNT(*)::text FROM "Property")
    WHEN 'Booking'           THEN (SELECT COUNT(*)::text FROM "Booking")
    WHEN 'AvailabilityCache' THEN (SELECT COUNT(*)::text FROM "AvailabilityCache")
    WHEN 'Payout'            THEN (SELECT COUNT(*)::text FROM "Payout")
    ELSE '-'
  END AS row_count
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
