'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchForm({ initialValues }: {
  initialValues?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}) {
  const router = useRouter();
  const [checkIn, setCheckIn]   = useState(initialValues?.checkIn  || '');
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || '');
  const [guests, setGuests]     = useState(initialValues?.guests   || 2);

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    const p = new URLSearchParams({ checkIn, checkOut, guests: guests.toString() });
    router.push(`/?${p.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 border border-white/60 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">

        {/* Check-in */}
        <div className="flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-slate-200/80">
          <label htmlFor="sf-checkin" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Check In
          </label>
          <input
            type="date"
            id="sf-checkin"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            className="w-full text-slate-800 font-semibold text-sm bg-transparent focus:outline-none"
            required
          />
        </div>

        {/* Check-out */}
        <div className="flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-slate-200/80">
          <label htmlFor="sf-checkout" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Check Out
          </label>
          <input
            type="date"
            id="sf-checkout"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            className="w-full text-slate-800 font-semibold text-sm bg-transparent focus:outline-none"
            required
          />
        </div>

        {/* Guests */}
        <div className="flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r border-slate-200/80">
          <label htmlFor="sf-guests" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Guests
          </label>
          <select
            id="sf-guests"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full text-slate-800 font-semibold text-sm bg-transparent focus:outline-none"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
            ))}
          </select>
        </div>

        {/* CTA */}
        <div className="flex items-center px-3 py-3">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-500/40 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
