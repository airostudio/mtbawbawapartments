import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { queryOne } from '@/lib/db';
import type { Property } from '@/lib/db/types';
import BookingForm from '@/components/BookingForm';

export const dynamic = 'force-dynamic';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

export default async function PropertyPage({ params, searchParams }: PropertyPageProps) {
  const { slug }  = await params;
  const search    = await searchParams;

  let property: Property | null = null;
  try {
    property = await queryOne<Property>(
      `SELECT * FROM "Property" WHERE "slug" = $1 AND "active" = true`,
      [slug],
    );
  } catch (err) {
    console.error('Failed to fetch property:', err);
  }

  if (!property) notFound();

  /* Back-link preserves search state */
  const backParams = new URLSearchParams();
  if (search.checkIn)  backParams.set('checkIn',  search.checkIn);
  if (search.checkOut) backParams.set('checkOut', search.checkOut);
  if (search.guests)   backParams.set('guests',   search.guests);
  const backHref = `/${backParams.toString() ? '?' + backParams.toString() : ''}`;

  const mainImage = property.images[0];
  const thumbImages = property.images.slice(1, 5);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb bar ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Properties
            </Link>
            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900 font-medium truncate max-w-xs">{property.name}</span>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* ── Image gallery (realestate.com.au grid layout) ──────── */}
      {mainImage ? (
        <div className="bg-black">
          <div className="max-w-7xl mx-auto grid grid-cols-4 grid-rows-2 h-[420px] sm:h-[500px] gap-0.5">
            {/* Main — spans 2 cols × 2 rows */}
            <div className="col-span-2 row-span-2 relative overflow-hidden">
              <Image
                src={mainImage}
                alt={property.name}
                fill
                className="object-cover"
                priority
              />
              {property.images.length > 5 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  View all {property.images.length} photos
                </div>
              )}
            </div>

            {/* 4 thumbnails */}
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="relative overflow-hidden">
                {thumbImages[idx - 1] ? (
                  <Image
                    src={thumbImages[idx - 1]}
                    alt={`${property.name} photo ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-mountain-900 to-mountain-800 flex items-center justify-center">
          <div className="text-center text-white/30">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
            No photos available
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: Property details (2/3 width) ─────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1.5">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Mt Baw Baw Alpine Resort, Victoria 3833
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-slate-900">
                    ${Math.round(property.basePrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">per night</div>
                </div>
              </div>

              {/* Spec pills */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-100">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 10V7a1 1 0 011-1h18a1 1 0 011 1v3h-1V7H3v3H2zm0 0h1v7H2v-7zm19 0h1v7h-1v-7zM1 17h22v2H1v-2zM3 10h18v5H3v-5z" />
                      </svg>
                    ),
                    label: `${property.bedrooms} ${property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 10H7V7a1 1 0 012 0v1h2V7a3 3 0 10-6 0v3H3a1 1 0 000 2h1l1 5.5A2.5 2.5 0 007.5 19h9a2.5 2.5 0 002.5-2.5L20 12h1a1 1 0 000-2z" />
                      </svg>
                    ),
                    label: `${property.bathrooms} ${property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    ),
                    label: `Sleeps ${property.sleeps}`,
                  },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-slate-700 font-medium">
                    {icon}
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3">About this property</h2>
              <p className="text-slate-600 leading-relaxed text-sm">{property.description}</p>
            </div>

            {/* Features & amenities */}
            {property.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Features &amp; Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Location</h2>

              {/* Map placeholder */}
              <div className="rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-blue-50 via-slate-100 to-mountain-100 h-44 border border-slate-200 flex flex-col items-center justify-center gap-2">
                <svg className="w-9 h-9 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Mt Baw Baw Alpine Resort</p>
                  <p className="text-xs text-slate-400">1,340 m above sea level · Victoria, Australia</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: '🚗', label: '~2.5 hrs from Melbourne CBD' },
                  { icon: '⛷', label: 'On-resort ski access' },
                  { icon: '🥾', label: 'Summer hiking trails nearby' },
                  { icon: '🏪', label: 'Resort village & restaurants' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-slate-600">
                    <span>{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right: Booking form sticky (1/3 width) ─────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <BookingForm
                property={property}
                initialCheckIn={search.checkIn}
                initialCheckOut={search.checkOut}
                initialGuests={search.guests ? parseInt(search.guests) : 2}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
