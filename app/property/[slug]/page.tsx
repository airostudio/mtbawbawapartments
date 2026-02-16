import { notFound } from 'next/navigation';
import Image from 'next/image';
import prisma from '@/lib/db';
import BookingForm from '@/components/BookingForm';

export const dynamic = 'force-dynamic';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

export default async function PropertyPage({ params, searchParams }: PropertyPageProps) {
  const { slug } = await params;
  const search = await searchParams;

  const property = await prisma.property.findUnique({
    where: { slug, active: true },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Property Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {property.images.length > 0 ? (
          <>
            <div className="relative h-96 md:col-span-2 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={property.images[0]}
                alt={property.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {property.images.slice(1, 5).map((image, idx) => (
              <div key={idx} className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`${property.name} - Image ${idx + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </>
        ) : (
          <div className="md:col-span-2 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.name}</h1>

          <div className="flex items-center space-x-6 text-gray-600 mb-6">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Sleeps {property.sleeps}
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              {property.bedrooms} Bedrooms
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {property.bathrooms} Bathrooms
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-bold mb-4">About this property</h2>
            <p className="text-gray-700">{property.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Features & Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.features.map((feature) => (
                <div key={feature} className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Location</h2>
            <p className="text-gray-700">
              Mt Baw Baw Alpine Resort, Victoria, Australia
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Experience the beauty of Victoria&apos;s alpine region with stunning mountain views
              and access to world-class skiing and outdoor activities.
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <BookingForm
            property={property}
            initialCheckIn={search.checkIn}
            initialCheckOut={search.checkOut}
            initialGuests={search.guests ? parseInt(search.guests) : 2}
          />
        </div>
      </div>
    </div>
  );
}
