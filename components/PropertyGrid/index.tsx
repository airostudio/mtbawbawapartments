import PropertyCard from './PropertyCard';

interface Property {
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
}

interface PropertyGridProps {
  properties: Property[];
  searchParams?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

export default function PropertyGrid({ properties, searchParams }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-5">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No properties found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          {searchParams?.checkIn
            ? 'Try adjusting your dates or reducing the guest count.'
            : 'Properties will appear here once added in the admin panel.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          searchParams={searchParams}
        />
      ))}
    </div>
  );
}
