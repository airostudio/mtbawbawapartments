import Link from 'next/link';
import PropertyGrid from '@/components/PropertyGrid';
import SearchForm from '@/components/DatePicker/SearchForm';
import { query } from '@/lib/db';
import type { Property } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const checkIn = params.checkIn;
  const checkOut = params.checkOut;
  const guests = params.guests ? parseInt(params.guests) : undefined;

  let properties: Property[] = [];
  let dbError = false;

  try {
    properties = guests
      ? await query<Property>(
          `SELECT * FROM "Property" WHERE "active" = true AND "sleeps" >= $1 ORDER BY "name" ASC`,
          [guests],
        )
      : await query<Property>(
          `SELECT * FROM "Property" WHERE "active" = true ORDER BY "name" ASC`,
        );
  } catch (err) {
    console.error('Failed to fetch properties:', err);
    dbError = true;
  }

  const hasSearch = !!(checkIn && checkOut);

  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mountain-950 via-mountain-900 to-mountain-800 text-white">

        {/* Dot-grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Mountain silhouette */}
        <svg
          className="absolute bottom-0 w-full text-mountain-800 opacity-40"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,200 L0,120 L180,40 L360,130 L540,20 L720,110 L900,30 L1080,120 L1260,50 L1440,100 L1440,200 Z" />
        </svg>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">

          {/* Location pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-blue-200 text-xs font-medium tracking-wide mb-7 border border-white/10">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Mt Baw Baw Alpine Resort · Victoria · 1,340 m elevation
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
            Your Perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-sky-200">
              Alpine Escape
            </span>
          </h1>

          <p className="text-blue-100/80 text-lg max-w-xl mx-auto mb-10">
            Premium apartments at Victoria&apos;s finest ski resort. Book direct and skip the platform fees.
          </p>

          {/* Search card */}
          <SearchForm initialValues={{ checkIn, checkOut, guests }} />

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            {[
              { value: `${properties.length}`, label: 'Properties' },
              { value: '1,340 m', label: 'Above Sea Level' },
              { value: '2.5 hrs', label: 'From Melbourne' },
              { value: 'Direct', label: 'Best Rates' },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex items-center gap-8">
                {i > 0 && <div className="h-8 w-px bg-white/15 hidden sm:block" />}
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-blue-300/80 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════ LISTINGS SECTION ══════════════════════ */}
      <section className="bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Results header */}
          <div className="flex items-end justify-between mb-6 border-b border-slate-200 pb-5">
            <div>
              {hasSearch ? (
                <>
                  <h2 className="text-xl font-bold text-slate-900">
                    {properties.length} {properties.length === 1 ? 'property' : 'properties'} available
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {fmtDate(checkIn!)} – {fmtDate(checkOut!)}
                    {guests && ` · ${guests} ${guests === 1 ? 'guest' : 'guests'}`}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">All Alpine Properties</h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {properties.length} {properties.length === 1 ? 'apartment' : 'apartments'} at Mt Baw Baw Resort
                  </p>
                </>
              )}
            </div>

            {/* Sort (decorative — real sorting would need client state) */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort: Recommended
            </div>
          </div>

          {dbError ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-5">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Properties temporarily unavailable</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                We&apos;re having trouble loading properties right now. Please try again in a few moments.
              </p>
            </div>
          ) : (
            <PropertyGrid properties={properties} searchParams={{ checkIn, checkOut, guests }} />
          )}
        </div>
      </section>

      {/* ══════════════ WHY MT BAW BAW ═══════════════════════════ */}
      {!hasSearch && (
        <section id="why" className="bg-white py-16 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Why Mt Baw Baw?</h2>
              <p className="text-slate-500 mt-2 text-sm">Victoria&apos;s best kept alpine secret</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  bg: 'bg-blue-50',
                  icon: (
                    <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ),
                  title: 'Ski-In, Ski-Out Access',
                  body: 'Apartments positioned right on the mountain. Step out the door and onto the slopes in minutes.',
                },
                {
                  bg: 'bg-green-50',
                  icon: (
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Book Direct & Save',
                  body: 'No third-party platform fees. Secure checkout direct with the property, at the best available rate.',
                },
                {
                  bg: 'bg-orange-50',
                  icon: (
                    <svg className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  ),
                  title: 'Premium Quality',
                  body: 'Every property is handpicked, inspected and maintained to resort standard, year round.',
                },
              ].map(({ bg, icon, title, body }) => (
                <div key={title} className={`${bg} rounded-2xl p-8 flex flex-col items-start gap-4`}>
                  <div className="rounded-xl p-3 bg-white shadow-sm">{icon}</div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resort info strip */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-mountain-900 to-mountain-800 text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold mb-1">Year-Round Alpine Destination</h3>
                <p className="text-blue-200/80 text-sm">
                  Winter skiing · Summer hiking · Cross-country trails · Family weekends
                </p>
              </div>
              <Link
                href="/"
                className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-orange-500/25"
              >
                Browse Properties →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
