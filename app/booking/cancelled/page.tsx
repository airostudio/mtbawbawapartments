import Link from 'next/link';

export default function BookingCancelledPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center">
      <div className="max-w-lg mx-auto w-full">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full mb-5 border-2 border-amber-100">
            <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Payment Cancelled</h1>
          <p className="text-slate-500 text-sm">
            No charge has been made. Your booking was not completed.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Need help?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            If you experienced an issue during checkout or changed your mind, we&apos;re happy to assist.
            Properties may still be available — head back and try again.
          </p>
          <ul className="text-sm text-slate-500 space-y-1.5">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hello@mtbawbawpts.com.au
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              1800 000 000
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 bg-mountain-800 hover:bg-mountain-700 text-white text-center font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            ← Back to Properties
          </Link>
          <Link
            href="/"
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
