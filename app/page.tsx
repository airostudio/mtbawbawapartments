import PropertyGrid from '@/components/PropertyGrid';
import SearchForm from '@/components/DatePicker/SearchForm';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const checkIn = params.checkIn;
  const checkOut = params.checkOut;
  const guests = params.guests ? parseInt(params.guests) : undefined;

  // Fetch all active properties
  // In a real implementation, if dates are provided, we'd filter by availability
  const properties = await prisma.property.findMany({
    where: {
      active: true,
      ...(guests ? { sleeps: { gte: guests } } : {}),
    },
    orderBy: {
      name: 'asc',
    },
  });

  const hasSearchParams = checkIn && checkOut;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Mountain Getaway
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Premium apartment rentals at Mt Baw Baw. Book directly and enjoy exclusive rates
          for your ski trip or mountain escape.
        </p>
      </div>

      {/* Search Form */}
      <SearchForm
        initialValues={{
          checkIn,
          checkOut,
          guests,
        }}
      />

      {/* Results Header */}
      {hasSearchParams && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h2>
          <p className="text-gray-600">
            {checkIn} to {checkOut} · {guests} {guests === 1 ? 'guest' : 'guests'}
          </p>
        </div>
      )}

      {/* Property Grid */}
      <PropertyGrid
        properties={properties}
        searchParams={{
          checkIn,
          checkOut,
          guests,
        }}
      />

      {/* Info Section */}
      {!hasSearchParams && (
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quality Properties</h3>
            <p className="text-gray-600">
              Handpicked apartments with modern amenities and stunning mountain views
            </p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Simple, secure checkout process with instant confirmation
            </p>
          </div>

          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Best Value</h3>
            <p className="text-gray-600">
              Competitive pricing with no hidden fees or surprises
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
