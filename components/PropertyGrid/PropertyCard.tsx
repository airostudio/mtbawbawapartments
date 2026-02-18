import Link from 'next/link';
import Image from 'next/image';

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    name: string;
    description: string;
    sleeps: number;
    bedrooms: number;
    bathrooms: number;
    features: string[];
    images: string[];
    basePrice: number;
  };
  searchParams?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

function fmtPrice(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function PropertyCard({ property, searchParams }: PropertyCardProps) {
  const sq = new URLSearchParams();
  if (searchParams?.checkIn)  sq.set('checkIn',  searchParams.checkIn);
  if (searchParams?.checkOut) sq.set('checkOut', searchParams.checkOut);
  if (searchParams?.guests)   sq.set('guests',   searchParams.guests.toString());

  const detailUrl = `/property/${property.slug}${sq.toString() ? `?${sq}` : ''}`;

  // Trip total when dates are provided
  let nights: number | null = null;
  let tripTotal: number | null = null;
  if (searchParams?.checkIn && searchParams?.checkOut) {
    const n = Math.ceil(
      (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime())
      / 86_400_000,
    );
    if (n > 0) { nights = n; tripTotal = property.basePrice * n; }
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-xl shadow-md transition-all duration-300 group flex flex-col relative">

      {/* Heart icon — purely decorative, outside any Link so no event handler needed */}
      <div
        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow z-20 pointer-events-none"
        aria-hidden="true"
      >
        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>

      {/* ── Image (full-card link) ── */}
      <Link href={detailUrl} className="relative block overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover property-card-img"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <svg className="w-14 h-14 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
            <span className="text-xs">No image available</span>
          </div>
        )}

        {/* Photo count badge */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {property.images.length} photos
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
          <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Mt Baw Baw Alpine Resort, VIC
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-slate-900 leading-snug mb-3 line-clamp-2">
          {property.name}
        </h3>

        {/* Specs — bed / bath / guests */}
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 10V7a1 1 0 011-1h18a1 1 0 011 1v3h-1V7H3v3H2zm0 0h1v7H2v-7zm19 0h1v7h-1v-7zM1 17h22v2H1v-2zM3 10h18v5H3v-5z" />
            </svg>
            {property.bedrooms} bd
          </span>
          <span className="text-slate-200">·</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 10H7V7a1 1 0 012 0v1h2V7a3 3 0 10-6 0v3H3a1 1 0 000 2h1l1 5.5A2.5 2.5 0 007.5 19h9a2.5 2.5 0 002.5-2.5L20 12h1a1 1 0 000-2z" />
            </svg>
            {property.bathrooms} ba
          </span>
          <span className="text-slate-200">·</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            {property.sleeps} guests
          </span>
        </div>

        {/* Feature chips */}
        {property.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {property.features.slice(0, 3).map((f) => (
              <span key={f} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {f}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                +{property.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: price + CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-2">
          <div>
            {nights && tripTotal ? (
              <>
                <div className="text-xs text-slate-400 mb-0.5">{nights} nights</div>
                <div className="text-xl font-bold text-slate-900">${fmtPrice(tripTotal)}</div>
              </>
            ) : (
              <>
                <div className="text-xs text-slate-400 mb-0.5">per night</div>
                <div className="text-xl font-bold text-slate-900">${fmtPrice(property.basePrice)}</div>
              </>
            )}
          </div>

          <Link
            href={detailUrl}
            className="bg-mountain-800 hover:bg-mountain-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
