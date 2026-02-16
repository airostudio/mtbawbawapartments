'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OperatorOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const operatorId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check current onboarding status
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch(`/api/operators/${operatorId}/onboard`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      } finally {
        setCheckingStatus(false);
      }
    }

    if (operatorId) {
      checkStatus();
    }
  }, [operatorId]);

  const handleStartOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/operators/${operatorId}/onboard`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start onboarding');
      }

      // Redirect to Stripe onboarding
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  const isOnboarded = status?.operator?.stripeOnboardingComplete;
  const hasAccount = status?.operator?.stripeAccountId;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stripe Connect Onboarding</h1>
          <p className="text-gray-600">Setup automated payouts for this operator</p>
        </div>
        <Link
          href={`/admin/operators/${operatorId}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back
        </Link>
      </div>

      {isOnboarded ? (
        <div className="bg-green-50 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Complete!</h2>
          <p className="text-gray-700 mb-6">
            This operator is fully set up with Stripe Connect. Automated payouts are enabled.
          </p>

          {status?.stripeAccount && (
            <div className="bg-white rounded-lg p-6 text-left mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {status.stripeAccount.chargesEnabled ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                  <span>Charges enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  {status.stripeAccount.payoutsEnabled ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                  <span>Payouts enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  {status.stripeAccount.detailsSubmitted ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                  <span>Details submitted</span>
                </div>
              </div>
            </div>
          )}

          <Link
            href={`/admin/operators/${operatorId}`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Operator Details
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {hasAccount ? 'Complete Stripe Onboarding' : 'Setup Stripe Connect'}
            </h2>
            <p className="text-gray-600">
              {hasAccount
                ? 'The operator has started but not completed Stripe onboarding.'
                : 'Enable automated payouts by connecting this operator to Stripe.'
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">1.</span>
                <span>You&apos;ll be redirected to Stripe to complete the onboarding process</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">2.</span>
                <span>The operator will need to provide business details and banking information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">3.</span>
                <span>Once verified, Stripe will automatically handle payouts for future bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">4.</span>
                <span>Your platform fee will be automatically deducted from each payment</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleStartOnboarding}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting...' : hasAccount ? 'Continue Onboarding' : 'Start Onboarding'}
            </button>
            <Link
              href={`/admin/operators/${operatorId}`}
              className="flex-1 bg-gray-200 text-gray-800 text-center px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">About Stripe Connect</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Stripe Connect</strong> enables automated payouts to your property operators while you collect your platform fee.
          </p>
          <p>
            When a guest books a property from an operator with Stripe Connect enabled:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Guest pays the full amount via Stripe Checkout</li>
            <li>Operator receives their portion automatically</li>
            <li>Your platform fee is automatically deducted</li>
            <li>No manual bank transfers needed!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
