import Link from 'next/link';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function OperatorsPage() {
  const operators = await prisma.operator.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          properties: true,
          payouts: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operators</h1>
          <p className="text-gray-600">Manage property operators and Stripe Connect accounts</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/admin/operators/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Operator
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stripe Connect
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payout Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No operators yet. Add your first operator to get started.
                  </td>
                </tr>
              ) : (
                operators.map((operator) => (
                  <tr key={operator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{operator.name}</div>
                      {operator.businessName && (
                        <div className="text-sm text-gray-500">{operator.businessName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{operator.email}</div>
                      {operator.phone && (
                        <div className="text-sm text-gray-500">{operator.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operator._count.properties} properties
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {operator.stripeAccountId ? (
                        <div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            operator.stripeAccountStatus === 'active'
                              ? 'bg-green-100 text-green-800'
                              : operator.stripeAccountStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {operator.stripeAccountStatus}
                          </span>
                          {operator.stripeOnboardingComplete ? (
                            <div className="text-xs text-green-600 mt-1">✓ Onboarded</div>
                          ) : (
                            <div className="text-xs text-orange-600 mt-1">⚠ Incomplete</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not connected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        operator.payoutMode === 'auto_connect'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {operator.payoutMode === 'auto_connect' ? 'Auto' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        operator.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {operator.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/operators/${operator.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      {!operator.stripeAccountId && (
                        <Link
                          href={`/admin/operators/${operator.id}/onboard`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Setup Stripe
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">About Stripe Connect</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Manual Mode:</strong> You manually pay operators via bank transfer after receiving payment from guests.
            Track payouts in the system for record-keeping.
          </p>
          <p>
            <strong>Auto Connect Mode:</strong> Operators connect their Stripe account. Payouts happen automatically
            via Stripe Connect when guests pay. Platform fee is deducted automatically.
          </p>
          <p className="mt-4">
            <strong>To enable Auto Mode:</strong> Click &quot;Setup Stripe&quot; next to an operator to start their onboarding process.
            They&apos;ll need to complete verification with Stripe before auto payouts can begin.
          </p>
        </div>
      </div>
    </div>
  );
}
