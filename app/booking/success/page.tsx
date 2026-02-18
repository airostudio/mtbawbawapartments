import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryOne } from '@/lib/db';
import type { Booking, Property } from '@/lib/db/types';
import { getCheckoutSession } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function fmtAUD(n: number) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) notFound();

  try {
    await getCheckoutSession(sessionId);

    const booking = await queryOne<Booking & { property: Property }>(
      `SELECT b.*, row_to_json(p) AS property
       FROM "Booking" b
       JOIN "Property" p ON b."propertyId" = p."id"
       WHERE b."stripeSessionId" = $1
       LIMIT 1`,
      [sessionId],
    );

    if (!booking) notFound();

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Success header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-5">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-500 text-sm">
              A confirmation email has been sent to <span className="font-medium text-slate-700">{booking.guestEmail}</span>
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

            {/* Coloured header strip */}
            <div className="bg-mountain-900 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-blue-300/70 mb-1">Booking Reference</div>
                <div className="font-mono font-bold text-lg tracking-wider">{booking.id.slice(0, 12).toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-blue-300/70 mb-1">Total Paid</div>
                <div className="text-2xl font-extrabold">{fmtAUD(booking.totalPrice)}</div>
                <div className="text-xs text-blue-300/60">AUD</div>
              </div>
            </div>

            {/* Property + dates */}
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900 mb-4">{booking.property.name}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Check In</div>
                  <div className="text-sm font-semibold text-slate-800">{fmtDate(booking.checkIn)}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Check Out</div>
                  <div className="text-sm font-semibold text-slate-800">{fmtDate(booking.checkOut)}</div>
                </div>
              </div>

              <div className="mt-3 flex gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                </span>
              </div>
            </div>

            {/* What happens next */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">What happens next?</h3>
              <ul className="space-y-3">
                {[
                  'You\'ll receive a confirmation email with full booking details shortly.',
                  'We\'re processing your booking with the property operator — they\'ll confirm within 24 hours.',
                  'Check-in instructions will be sent to you a few days before your arrival.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3">
            <Link
              href="/"
              className="flex-1 bg-mountain-800 hover:bg-mountain-700 text-white text-center font-semibold py-3.5 rounded-xl transition-colors text-sm"
            >
              ← Browse More Properties
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Questions? Email <a href="mailto:hello@mtbawbawpts.com.au" className="text-blue-500 hover:underline">hello@mtbawbawpts.com.au</a>
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading booking success page:', error);
    notFound();
  }
}
