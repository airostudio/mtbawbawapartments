import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query, queryOne } from '@/lib/db';
import type { Operator, Property, Payout } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

interface OperatorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OperatorDetailPage({ params }: OperatorDetailPageProps) {
  const { id } = await params;

  const operator = await queryOne<Operator>(
    `SELECT * FROM "Operator" WHERE "id" = $1`,
    [id],
  );

  if (!operator) {
    notFound();
  }

  const properties = await query<Property & { _count: { bookings: number } }>(
    `SELECT p.*,
       json_build_object('bookings', (SELECT COUNT(*)::int FROM "Booking" WHERE "propertyId" = p."id")) AS "_count"
     FROM "Property" p
     WHERE p."operatorId" = $1`,
    [id],
  );

  const payouts = await query<Payout>(
    `SELECT * FROM "Payout" WHERE "operatorId" = $1 ORDER BY "createdAt" DESC LIMIT 10`,
    [id],
  );

  // Calculate total earnings
  const totalPayouts = payouts
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = payouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{operator.name}</h1>
          <p className="text-gray-600">{operator.email}</p>
        </div>
        <Link
          href="/admin/operators"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Operators
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Paid Out</p>
          <p className="text-3xl font-bold text-gray-900">${totalPayouts.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pending Payouts</p>
          <p className="text-3xl font-bold text-orange-600">${pendingPayouts.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Properties</p>
          <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operator Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{operator.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{operator.email}</dd>
              </div>
              {operator.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{operator.phone}</dd>
                </div>
              )}
              {operator.businessName && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{operator.businessName}</dd>
                </div>
              )}
              {operator.bookingUrl && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Booking URL</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={operator.bookingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {operator.bookingUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Properties</h2>
            {properties.length === 0 ? (
              <p className="text-gray-500">No properties assigned yet</p>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-600">
                          Sleeps {property.sleeps} · {property.bedrooms} bed · {property.bathrooms} bath
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {property._count.bookings} bookings
                        </p>
                      </div>
                      <Link
                        href={`/property/${property.slug}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payouts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Payouts</h2>
            {payouts.length === 0 ? (
              <p className="text-gray-500">No payouts yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="py-2 text-sm text-gray-900">
                          {payout.createdAt.toLocaleDateString('en-AU')}
                        </td>
                        <td className="py-2 text-sm text-gray-900 font-medium">
                          ${payout.amount.toFixed(2)}
                        </td>
                        <td className="py-2 text-sm text-gray-600">
                          {payout.bookingIds.length} bookings
                        </td>
                        <td className="py-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payout.status === 'succeeded'
                              ? 'bg-green-100 text-green-800'
                              : payout.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : payout.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stripe Connect Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Stripe Connect</h3>
            {operator.stripeAccountId ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Account ID</p>
                  <p className="text-sm font-mono text-gray-900">{operator.stripeAccountId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    operator.stripeAccountStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {operator.stripeAccountStatus}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {operator.stripeOnboardingComplete ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                    <span>Onboarding complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {operator.stripeChargesEnabled ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                    <span>Charges enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {operator.stripePayoutsEnabled ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                    <span>Payouts enabled</span>
                  </div>
                </div>
                {!operator.stripeOnboardingComplete && (
                  <Link
                    href={`/admin/operators/${operator.id}/onboard`}
                    className="block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Complete Onboarding
                  </Link>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Not connected to Stripe. Enable auto payouts by setting up Stripe Connect.
                </p>
                <Link
                  href={`/admin/operators/${operator.id}/onboard`}
                  className="block text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Setup Stripe Connect
                </Link>
              </div>
            )}
          </div>

          {/* Payout Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Payout Settings</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Mode</dt>
                <dd className="font-medium text-gray-900">
                  {operator.payoutMode === 'auto_connect' ? 'Auto (Stripe Connect)' : 'Manual'}
                </dd>
              </div>
              {operator.payoutSchedule && (
                <div>
                  <dt className="text-gray-500">Schedule</dt>
                  <dd className="font-medium text-gray-900 capitalize">{operator.payoutSchedule}</dd>
                </div>
              )}
              {operator.minimumPayout && (
                <div>
                  <dt className="text-gray-500">Minimum Payout</dt>
                  <dd className="font-medium text-gray-900">${operator.minimumPayout}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/operators/${operator.id}/edit`}
                className="block text-center bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Edit Details
              </Link>
              <button
                className="w-full text-center bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
