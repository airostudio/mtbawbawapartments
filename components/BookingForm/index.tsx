'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  property: {
    id: string;
    name: string;
    basePrice: number;
    markupPercent: number;
    sleeps: number;
  };
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

function fmtAUD(n: number) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function BookingForm({
  property,
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 2,
}: BookingFormProps) {
  const router = useRouter();
  const [checkIn,    setCheckIn]    = useState(initialCheckIn);
  const [checkOut,   setCheckOut]   = useState(initialCheckOut);
  const [guests,     setGuests]     = useState(initialGuests);
  const [guestName,  setGuestName]  = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const today = new Date().toISOString().split('T')[0];

  const calcPrice = () => {
    if (!checkIn || !checkOut) return null;
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000,
    );
    if (nights < 1) return null;
    const basePrice = property.basePrice * nights;
    const markup    = basePrice * (property.markupPercent / 100);
    return { nights, basePrice, markup, total: basePrice + markup };
  };

  const price = calcPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          guestPhone,
          numberOfGuests: guests,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout');
      if (data.sessionUrl) window.location.href = data.sessionUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

      {/* ── Price header ───────────────────────────────────── */}
      <div className="bg-mountain-900 text-white px-6 py-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">{fmtAUD(property.basePrice)}</span>
          <span className="text-blue-300 font-medium">/ night</span>
        </div>
        {property.markupPercent > 0 && (
          <p className="text-blue-300/60 text-xs mt-1">
            {property.markupPercent}% service fee included in total
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">

        {/* ── Dates ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Check In
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={today}
              className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Check Out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || today}
              className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* ── Guests ──────────────────────────────────────────── */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: property.sleeps }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>

        {/* ── Price breakdown ──────────────────────────────────── */}
        {price && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                {fmtAUD(property.basePrice)} × {price.nights} {price.nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="font-medium text-slate-800">{fmtAUD(price.basePrice)}</span>
            </div>
            {property.markupPercent > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Service fee ({property.markupPercent}%)</span>
                <span className="font-medium text-slate-800">{fmtAUD(price.markup)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2.5">
              <span className="text-slate-900">Total AUD</span>
              <span className="text-slate-900">{fmtAUD(price.total)}</span>
            </div>
          </div>
        )}

        {/* ── Guest details ─────────────────────────────────────── */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Guest Details</h3>

          <input
            type="text"
            placeholder="Full Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            required
          />
        </div>

        {/* ── Error ──────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ── Submit ─────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={loading || !price}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/25 text-sm"
        >
          {loading
            ? 'Processing…'
            : price
            ? `Book Now · ${fmtAUD(price.total)} AUD`
            : 'Select dates to continue'}
        </button>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure checkout · Powered by Stripe
        </div>

      </form>
    </div>
  );
}
