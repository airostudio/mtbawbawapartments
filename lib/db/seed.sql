-- ============================================================
-- Mt Baw Baw Apartments — Seed Data
-- ============================================================
-- Safe to run multiple times (ON CONFLICT DO NOTHING).
-- Apply to a fresh database with:
--   psql "$DATABASE_URL" -f lib/db/schema.sql
--   psql "$DATABASE_URL" -f lib/db/seed.sql
-- ============================================================

INSERT INTO "Property" (
  "id", "name", "slug", "description",
  "sleeps", "bedrooms", "bathrooms",
  "features", "images", "basePrice",
  "operatorName", "operatorContact",
  "connectorType", "markupPercent", "active",
  "createdAt", "updatedAt"
) VALUES

-- Property 1
(
  'prop-001',
  'Summit View Chalet',
  'summit-view-chalet',
  'Perched at the top of the resort with panoramic views of the Victorian Alps, this spacious chalet offers ski-in, ski-out access and a cosy wood-fire atmosphere. Perfect for families and groups seeking an unforgettable alpine experience.',
  8, 4, 2,
  ARRAY['Ski-In Ski-Out','Wood Fireplace','Mountain Views','Full Kitchen','Wi-Fi','Dishwasher','Washing Machine','Parking'],
  ARRAY[
    'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=1200',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
  ],
  420.00,
  'Mt Baw Baw Resorts Pty Ltd', 'hello@mtbawbawresorts.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- Property 2
(
  'prop-002',
  'The Snowgum Retreat',
  'snowgum-retreat',
  'A beautifully appointed mid-mountain retreat surrounded by ancient snowgum trees. Enjoy a private deck with breathtaking forest and mountain views. Ideal for couples and small families looking for a quiet, restorative escape.',
  4, 2, 1,
  ARRAY['Forest Views','Private Deck','Electric Heating','Full Kitchen','Wi-Fi','Smart TV','Parking'],
  ARRAY[
    'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=1200',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200'
  ],
  280.00,
  'Mt Baw Baw Resorts Pty Ltd', 'hello@mtbawbawresorts.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- Property 3
(
  'prop-003',
  'Alpine Lodge — Family Suite',
  'alpine-lodge-family-suite',
  'Generous resort-lodge accommodation with everything a family needs. Walk to the ski lifts and village restaurants in under two minutes. The open-plan living and dining area seats the whole group, and bunk beds make kids feel right at home.',
  6, 3, 2,
  ARRAY['Walk to Lifts','Bunk Beds','Open-Plan Living','Full Kitchen','Wi-Fi','Ski Storage','Parking'],
  ARRAY[
    'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=1200',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'
  ],
  350.00,
  'Alpine Properties Victoria', 'bookings@alpineproperties.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- Property 4
(
  'prop-004',
  'Powder Run Studio',
  'powder-run-studio',
  'Compact, modern studio apartment — everything you need for a ski trip, nothing you do not. Steps from the main lift and the village bar. Great value for couples or solo adventurers who want maximum slope time.',
  2, 1, 1,
  ARRAY['Steps to Lifts','Modern Kitchen','Wi-Fi','Smart TV','Electric Heating','Ski Locker'],
  ARRAY[
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200'
  ],
  180.00,
  'Alpine Properties Victoria', 'bookings@alpineproperties.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
)

ON CONFLICT ("slug") DO NOTHING;
