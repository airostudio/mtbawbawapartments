import { notFound } from 'next/navigation';
import Link from 'next/link';
import { queryOne } from '@/lib/db';
import type { Booking, Property } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;

  const booking = await queryOne<Booking & { property: Property }>(
    `SELECT b.*, row_to_json(p) AS property
     FROM "Booking" b
     JOIN "Property" p ON b."propertyId" = p."id"
     WHERE b."id" = $1`,
    [id],
  );

  if (!booking) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 font-mono">{booking.id}</p>
        </div>
        <Link
          href="/admin/bookings"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Bookings
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.guestName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.guestEmail}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.guestPhone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Number of Guests</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.numberOfGuests}</dd>
              </div>
            </dl>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Property</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.property.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nights</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.nights}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Check-in</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.checkIn.toLocaleDateString('en-AU')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Check-out</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.checkOut.toLocaleDateString('en-AU')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Booking Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.paymentStatus === 'succeeded'
                      ? 'bg-green-100 text-green-800'
                      : booking.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Financial Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Base Price ({booking.nights} nights × ${booking.basePricePerNight})</dt>
                <dd className="text-sm text-gray-900">${booking.totalBasePrice.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Markup ({booking.markupPercent}%)</dt>
                <dd className="text-sm text-gray-900">${booking.totalMarkup.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3">
                <dt className="text-base font-semibold text-gray-900">Total Charged to Guest</dt>
                <dd className="text-base font-semibold text-gray-900">${booking.totalPrice.toFixed(2)} AUD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Stripe Fee</dt>
                <dd className="text-sm text-red-600">-${booking.stripeFee.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3">
                <dt className="text-base font-semibold text-green-700">Net Profit</dt>
                <dd className="text-base font-semibold text-green-700">${booking.netProfit.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Operator Actions */}
        <div className="md:col-span-1">
          <div className="bg-orange-50 border border-orange-200 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-orange-900 mb-4">⚠️ Action Required</h2>
            <p className="text-sm text-orange-800 mb-4">
              Book this reservation with the property operator
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-orange-700 font-medium">Operator</p>
                <p className="text-sm text-orange-900">{booking.property.operatorName}</p>
              </div>
              <div>
                <p className="text-xs text-orange-700 font-medium">Contact</p>
                <p className="text-sm text-orange-900">{booking.property.operatorContact}</p>
              </div>
              {booking.property.operatorEmail && (
                <div>
                  <p className="text-xs text-orange-700 font-medium">Email</p>
                  <p className="text-sm text-orange-900">{booking.property.operatorEmail}</p>
                </div>
              )}
              {booking.property.operatorBookingUrl && (
                <div>
                  <p className="text-xs text-orange-700 font-medium">Booking URL</p>
                  <a
                    href={booking.property.operatorBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open booking portal →
                  </a>
                </div>
              )}
            </div>

            <div className="bg-white rounded p-3 mb-4">
              <p className="text-xs text-gray-600 mb-1">Amount to pay operator:</p>
              <p className="text-2xl font-bold text-gray-900">${booking.totalBasePrice.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <button
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Mark as Confirmed
              </button>
              <button
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel Booking
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Additional Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{booking.createdAt.toLocaleString('en-AU')}</dd>
              </div>
              {booking.operatorConfirmation && (
                <div>
                  <dt className="text-gray-500">Operator Confirmation #</dt>
                  <dd className="text-gray-900">{booking.operatorConfirmation}</dd>
                </div>
              )}
              {booking.notes && (
                <div>
                  <dt className="text-gray-500">Notes</dt>
                  <dd className="text-gray-900">{booking.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
