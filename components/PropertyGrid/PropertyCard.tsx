import Link from 'next/link';
import Image from 'next/image';

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    name: string;
    description: string;
    sleeps: number;
    bedrooms: number;
    bathrooms: number;
    features: string[];
    images: string[];
    basePrice: number;
  };
  searchParams?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

export default function PropertyCard({ property, searchParams }: PropertyCardProps) {
  const displayPrice = property.basePrice;
  const hasSearchParams = searchParams?.checkIn && searchParams?.checkOut;

  const searchQuery = new URLSearchParams();
  if (searchParams?.checkIn) searchQuery.set('checkIn', searchParams.checkIn);
  if (searchParams?.checkOut) searchQuery.set('checkOut', searchParams.checkOut);
  if (searchParams?.guests) searchQuery.set('guests', searchParams.guests.toString());

  const detailUrl = `/property/${property.slug}${searchQuery.toString() ? `?${searchQuery.toString()}` : ''}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 bg-gray-200">
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>

        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Sleeps {property.sleeps}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            {property.bedrooms} bed
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {property.bathrooms} bath
          </span>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{property.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {property.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {feature}
            </span>
          ))}
          {property.features.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{property.features.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              ${displayPrice.toFixed(0)}
              <span className="text-sm font-normal text-gray-600">/night</span>
            </p>
            {!hasSearchParams && (
              <p className="text-xs text-gray-500">Base price</p>
            )}
          </div>
          <Link
            href={detailUrl}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
