-- ============================================================
-- Mt Baw Baw Apartments — Property Seed Data
-- ============================================================
-- Real properties at Mt Baw Baw Alpine Resort, Victoria.
-- Safe to re-run: ON CONFLICT ("slug") DO NOTHING.
--
-- Apply to database with:
--   psql "$DATABASE_URL" -f lib/db/schema.sql
--   psql "$DATABASE_URL" -f lib/db/seed.sql
-- ============================================================

INSERT INTO "Property" (
  "id", "name", "slug", "description",
  "sleeps", "bedrooms", "bathrooms",
  "features", "images", "basePrice",
  "operatorName", "operatorContact", "operatorEmail", "operatorBookingUrl",
  "connectorType", "markupPercent", "active",
  "createdAt", "updatedAt"
) VALUES

-- ── Mt Baw Baw Resort–Owned ──────────────────────────────────────────────────

-- 1. Woollybutt Cabin
(
  'prop-woollybutt-cabin',
  'Woollybutt Cabin',
  'woollybutt-cabin',
  'A self-contained 2 bedroom cabin set in a tranquil location among spectacular snow gums, close to the Maltese Cross T-Bar and walking tracks. The perfect secluded alpine escape. Available in winter and on event weekends in summer.',
  6, 2, 1,
  ARRAY['Self-contained','Snow gum setting','Near Maltese Cross T-Bar','Walking tracks','Ski storage','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200',
    'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=1200'
  ],
  290.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 2. Benbullen Ski Club
(
  'prop-benbullen-ski-club',
  'Benbullen Ski Club',
  'benbullen-ski-club',
  'A warm and inviting lodge located only a few metres from the Toboggan Park and the Maltese Cross T-Bar. The lodge sleeps up to 25 people in 6 rooms and contains a fully equipped open plan kitchen, dining and lounge room. Available for summer bookings.',
  25, 6, 3,
  ARRAY['Open plan kitchen','Dining room','Lounge room','Near Toboggan Park','Near Maltese Cross T-Bar','Group friendly','Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=1200'
  ],
  750.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 3. Altitude Apartments
(
  'prop-altitude-apartments',
  'Altitude Apartments',
  'altitude-apartments',
  'Private and self-contained with a kitchen, lounge, two bedrooms and a bathroom. Located in the heart of the village and close to ski and dining facilities. Available in winter and on event weekends in summer.',
  6, 2, 1,
  ARRAY['Self-contained','Kitchen','Lounge','Heart of village','Near ski facilities','Near dining','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200'
  ],
  320.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 4. Bunerong Lodge
(
  'prop-bunerong-lodge',
  'Bunerong Lodge',
  'bunerong-lodge',
  'The perfect base for exploring the natural beauty of the alpine environment with easy access to trails around the village and the Baw Baw National Park. The lodge accommodates groups of up to 13 people with fully equipped kitchen facilities. Available in winter and on event weekends in summer.',
  13, 4, 2,
  ARRAY['Full kitchen','Alpine trail access','Baw Baw National Park','Group friendly','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
    'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=1200'
  ],
  520.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 5. Frosti Lodge
(
  'prop-frosti-lodge',
  'Frosti Lodge',
  'frosti-lodge',
  'A large spacious family lodge with 8 private bedrooms, shared bathrooms, sleeping up to 24 people. Features a large kitchen and open plan living area, central heating, a large drying room and flat screen TV and DVD facilities. Available in winter and on event weekends in summer.',
  24, 8, 4,
  ARRAY['8 private bedrooms','Full kitchen','Open plan living','Central heating','Drying room','Flat screen TV','DVD','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'
  ],
  720.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 6. Snowgum Apartment 1
(
  'prop-snowgum-apartment-1',
  'Snowgum Apartment 1',
  'snowgum-apartment-1',
  'A private, fully self-contained luxury 2 bedroom apartment set in the centre of the village overlooking the Frosti Frog Hollow Toboggan Run. A short walk to all ski and walking trails. Features a spa bath in the main bedroom and a complimentary bottle of wine on arrival. Available in winter and on event weekends in summer.',
  5, 2, 1,
  ARRAY['Luxury','Spa bath','Self-contained','Toboggan run views','Central village','Near ski trails','Complimentary wine','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=1200',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200'
  ],
  380.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 7. Snowgum Apartment 2
(
  'prop-snowgum-apartment-2',
  'Snowgum Apartment 2',
  'snowgum-apartment-2',
  'A private, fully self-contained luxury 2 bedroom apartment set in the centre of the village overlooking the Frosti Frog Hollow Toboggan Run. A short walk to all ski and walking trails. Features a spa bath in the main bedroom and a complimentary bottle of wine on arrival. Available in winter and on event weekends in summer.',
  5, 2, 1,
  ARRAY['Luxury','Spa bath','Self-contained','Toboggan run views','Central village','Near ski trails','Complimentary wine','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=1200',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200'
  ],
  380.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 8. Site 11 Lodge
(
  'prop-site-11-lodge',
  'Site 11 Lodge',
  'site-11-lodge',
  'Comfortable, spacious and located in the heart of Mt Baw Baw. Site 11 has 4 rooms sleeping up to 12 people, featuring a large dining and lounge area with a pool table. Located above Cafe 11 and overlooking Frosti Frog Toboggan Park. Available in winter and on event weekends in summer.',
  12, 4, 2,
  ARRAY['Pool table','Large lounge','Dining area','Toboggan park views','Above Cafe 11','Central location','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=1200',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
  ],
  480.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- 9. Wombat Cabin
(
  'prop-wombat-cabin',
  'Wombat Cabin',
  'wombat-cabin',
  'Set in a tranquil location amongst spectacular snow gums, a short distance from the Maltese Cross T-Bar and Toboggan Park. Includes ski and board lock-up outside and a private covered balcony overlooking the alpine snow gums — the perfect spot for a secluded escape. Sleeps up to 5 people. Available in winter and on event weekends in summer.',
  5, 2, 1,
  ARRAY['Snow gum setting','Ski & board lock-up','Private covered balcony','Near Maltese Cross T-Bar','Near Toboggan Park','Secluded','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200',
    'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=1200'
  ],
  270.00,
  'Mt Baw Baw Alpine Resort', 'reception@mtbawbaw.com.au', 'reception@mtbawbaw.com.au', 'https://www.mtbawbaw.com.au',
  'manual', 20.0, true,
  NOW(), NOW()
),

-- ── Privately Managed ────────────────────────────────────────────────────────

-- 10. Anare Ski Club
(
  'prop-anare-ski-club',
  'Anare Ski Club',
  'anare-ski-club',
  'Ideal for big family groups, this cosy three level A-frame chalet is located in the heart of the Village. Just 50 m from the day car park and a short walk to ski hire facilities, ski runs and dining facilities. Available in winter and summer.',
  14, 4, 2,
  ARRAY['A-frame chalet','3 levels','Near day car park','Near ski hire','Near ski runs','Near dining','Family friendly','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=1200',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200'
  ],
  480.00,
  'Anare Ski Club', 'Privately managed — book via Anare website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 11. Coora Valley Chalet
(
  'prop-coora-valley-chalet',
  'Coora Valley Chalet',
  'coora-valley-chalet',
  'A premium chalet offering modern facilities and spacious living for up to 9 people across three separate bedrooms. Fully equipped kitchen, bathroom, large lounge with TV, DVD, Xbox, PlayStation 3 and surround sound, laundry, pool table and foosball table. Available in winter and summer.',
  9, 3, 1,
  ARRAY['Modern facilities','Full kitchen','Pool table','Foosball','Gaming consoles','Surround sound','Laundry','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=1200'
  ],
  520.00,
  'Coora Valley Chalet', 'Privately managed — book directly with lodge', NULL, NULL,
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 12. Cascade Apartment 3
(
  'prop-cascade-apartment-3',
  'Cascade Apartment 3',
  'cascade-apartment-3',
  'A fully self-contained private apartment ideal for holidays in both winter and summer. Individually owned and self-contained, varying from cosy one bedroom to two bedroom layouts suitable for families or small groups. Book directly with the accommodation.',
  6, 2, 1,
  ARRAY['Self-contained','Private','Family friendly','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200'
  ],
  280.00,
  'Cascade Apartments', 'Privately managed — book directly with accommodation', NULL, NULL,
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 13. Cascade Apartment 4
(
  'prop-cascade-apartment-4',
  'Cascade Apartment 4',
  'cascade-apartment-4',
  'A fully self-contained apartment with private entrance. Main bedroom has a queen bed and a single bunk. Second room has a tri-bunk bed — perfect for families. Available in winter. Book via the Cascade Apartment 4 website.',
  7, 2, 1,
  ARRAY['Self-contained','Private entrance','Queen bed','Bunk beds','Family friendly','Winter'],
  ARRAY[
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200'
  ],
  260.00,
  'Cascade Apartment 4', 'Privately managed — book via website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 14. Cascade Apartment 6  (currently unavailable — inactive)
(
  'prop-cascade-apartment-6',
  'Cascade Apartment 6',
  'cascade-apartment-6',
  'A fully self-contained private apartment at Mt Baw Baw Alpine Resort. Part of the Cascade Apartments complex. Currently unavailable for bookings.',
  6, 2, 1,
  ARRAY['Self-contained','Private','Winter & Summer'],
  '{}',
  280.00,
  'Cascade Apartments', 'Currently unavailable', NULL, NULL,
  'manual', 15.0, false,
  NOW(), NOW()
),

-- 15. Du Nord Ski Club
(
  'prop-du-nord-ski-club',
  'Du Nord Ski Club',
  'du-nord-ski-club',
  'A traditional ski lodge located in the heart of the Mt Baw Baw Village. Affordable, self-catered accommodation for up to 24 people in a spacious, welcoming environment perfectly set up for families, group bookings or school trips. Available in winter and summer.',
  24, 8, 4,
  ARRAY['Traditional ski lodge','Self-catered','Family friendly','Group bookings','School trips','Central village','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
  ],
  680.00,
  'Du Nord Ski Club', 'Privately managed — book via Du Nord website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 16. Everest Ski Lodge
(
  'prop-everest-ski-lodge',
  'Everest Ski Lodge',
  'everest-ski-lodge',
  'A large split-level lodge perfect for families, large groups or school groups. Accommodates up to 39 people in 8 bedrooms (green season) with shared facilities including a large fully equipped kitchen, open plan living area with TV and DVD player, and 3 bathrooms. Available in winter and summer.',
  39, 8, 3,
  ARRAY['Split level','Large kitchen','Open plan living','TV','DVD','3 bathrooms','School groups','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=1200'
  ],
  950.00,
  'Everest Ski Lodge', 'Privately managed — book via Everest website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 17. Edski Lodge
(
  'prop-edski-lodge',
  'Edski Lodge',
  'edski-lodge',
  'Catering to family and group bookings with 10 rooms available in both summer and winter. Also caters to school groups. A welcoming alpine lodge with everything you need for a mountain getaway.',
  30, 10, 4,
  ARRAY['10 rooms','Family groups','School groups','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
    'https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=1200'
  ],
  720.00,
  'Edski Lodge', 'Privately managed — book via Edski website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 18. John Gardiner Ski Club
(
  'prop-john-gardiner-ski-club',
  'John Gardiner Ski Club',
  'john-gardiner-ski-club',
  'A family-friendly alpine lodge great for groups in both summer and winter. 24 beds across 6 bedrooms, all with private bathrooms. Two large shared lounges, a double kitchen and a functional drying room. Available in winter and summer.',
  24, 6, 6,
  ARRAY['Private bathrooms','2 shared lounges','Double kitchen','Drying room','Family friendly','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'
  ],
  680.00,
  'John Gardiner Ski Club', 'Privately managed — book via John Gardiner website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 19. Mt Baw Baw Apartments & Bar — Apartment 2
(
  'prop-mtbb-apartment-2',
  'Mt Baw Baw Apartments & Bar — Apt 2',
  'mt-baw-baw-apartment-2',
  'Self-contained apartment close to all resort facilities. Apartment 2 sleeps 10 people. Privately run and operated. Available in winter and summer.',
  10, 3, 2,
  ARRAY['Self-contained','Close to resort facilities','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200'
  ],
  420.00,
  'Mt Baw Baw Apartments & Bar', 'Privately managed — book via website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 20. Mt Baw Baw Apartments & Bar — Apartment 7
(
  'prop-mtbb-apartment-7',
  'Mt Baw Baw Apartments & Bar — Apt 7',
  'mt-baw-baw-apartment-7',
  'Self-contained apartment close to all resort facilities. Apartment 7 sleeps 4 people. Privately run and operated. Available in winter and summer.',
  4, 1, 1,
  ARRAY['Self-contained','Close to resort facilities','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200'
  ],
  220.00,
  'Mt Baw Baw Apartments & Bar', 'Privately managed — book via website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 21. Mt Baw Baw Apartments & Bar — Apartment 8
(
  'prop-mtbb-apartment-8',
  'Mt Baw Baw Apartments & Bar — Apt 8',
  'mt-baw-baw-apartment-8',
  'Self-contained apartment close to all resort facilities. Apartment 8 sleeps 4 people. Privately run and operated. Available in winter and summer.',
  4, 1, 1,
  ARRAY['Self-contained','Close to resort facilities','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200'
  ],
  220.00,
  'Mt Baw Baw Apartments & Bar', 'Privately managed — book via website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 22. Mt Baw Baw Apartments & Bar — Apartment 9
(
  'prop-mtbb-apartment-9',
  'Mt Baw Baw Apartments & Bar — Apt 9',
  'mt-baw-baw-apartment-9',
  'Self-contained apartment close to all resort facilities. Apartment 9 sleeps 10 people. Privately run and operated. Available in winter and summer.',
  10, 3, 2,
  ARRAY['Self-contained','Close to resort facilities','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200'
  ],
  420.00,
  'Mt Baw Baw Apartments & Bar', 'Privately managed — book via website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 23. Lonsdale Ski Lodge
(
  'prop-lonsdale-ski-lodge',
  'Lonsdale Ski Lodge',
  'lonsdale-ski-lodge',
  'Accommodates up to 20 people in four cosy bunkrooms. Features a shared, self-contained kitchen and dining area, shared bathroom with showers, upstairs living space and a large drying room with laundry facilities. Open year-round with immediate access to Mt Baw Baw ski runs and lifts. Available in winter and summer.',
  20, 4, 2,
  ARRAY['Bunkrooms','Self-contained kitchen','Drying room','Laundry','Direct ski access','Year-round','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200'
  ],
  580.00,
  'Lonsdale Ski Lodge', 'Privately managed — book via Lonsdale website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 24. Skali Ski Club
(
  'prop-skali-ski-club',
  'Skali Ski Club',
  'skali-ski-club',
  'A comfortable family-friendly lodge with excellent facilities, suitable for small or large groups all year round. Five guest rooms accommodate up to 23 people, with en-suites or private bathrooms for each room. Facilities include a large family lounge room, a washing machine and dryer and en-suites or dedicated bathrooms. Book directly with the lodge.',
  23, 5, 5,
  ARRAY['En-suite bathrooms','Private bathrooms','Family lounge','Washing machine','Dryer','Family friendly','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=1200'
  ],
  680.00,
  'Skali Ski Club', 'Privately managed — book directly with lodge', NULL, NULL,
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 25. Halls Retreat
(
  'prop-halls-retreat',
  'Halls Retreat',
  'halls-retreat',
  'A luxurious private apartment with a fully equipped kitchen, leather lounge and a 65 inch TV with Netflix and Sonos sound system. An ensuite bathroom and indoor spa room with wall-mounted large screen TV. Views over snow gums and mossy granite boulders, with a small deck and barbecue. Located in the heart of the village overlooking the Frosti Toboggan Park, with a natural bush track leading to the Village Cafe. Available in winter and summer.',
  2, 1, 1,
  ARRAY['Luxury','Indoor spa','65" Netflix TV','Sonos sound','BBQ deck','Snow gum views','Toboggan park views','Village location','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=1200',
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200'
  ],
  280.00,
  'Tanjil Creek', 'Privately managed — book via Tanjil Creek website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
),

-- 26. Tanjil Creek Lodge
(
  'prop-tanjil-creek-lodge',
  'Tanjil Creek Lodge',
  'tanjil-creek-lodge',
  'Located in the centre of Mt Baw Baw village, containing four lockable bedrooms each with their own bathroom. Fully equipped shared kitchen and lounge with smart TV, a gas log fire and drying room. Book rooms individually or the whole lodge (rooms 1–4), suiting couples, families or large groups. Available in winter and summer.',
  8, 4, 4,
  ARRAY['Private bathrooms','Smart TV','Gas log fire','Full kitchen','Drying room','Individual rooms','Whole lodge','Winter & Summer'],
  ARRAY[
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200',
    'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=1200'
  ],
  460.00,
  'Tanjil Creek', 'Privately managed — book via Tanjil Creek website', NULL, 'https://www.mtbawbaw.com.au/accommodation',
  'manual', 15.0, true,
  NOW(), NOW()
)

ON CONFLICT ("slug") DO NOTHING;
