/**
 * Database model types — direct replacements for Prisma's auto-generated types.
 * Column names match the existing Prisma-created PostgreSQL schema exactly.
 */

export interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  sleeps: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  images: string[];
  basePrice: number;
  operatorId: string | null;
  operatorName: string;
  operatorContact: string;
  operatorEmail: string | null;
  operatorBookingUrl: string | null;
  connectorType: string;
  connectorConfig: Record<string, any> | null;
  markupPercent: number;
  seasonalMarkup: Record<string, any> | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  basePricePerNight: number;
  markupPercent: number;
  totalBasePrice: number;
  totalMarkup: number;
  totalPrice: number;
  stripeFee: number;
  netProfit: number;
  stripePaymentIntent: string | null;
  stripeSessionId: string | null;
  paymentStatus: string;
  stripeTransferId: string | null;
  stripeTransferStatus: string | null;
  platformFeeAmount: number | null;
  status: string;
  operatorConfirmation: string | null;
  operatorPaid: boolean;
  operatorPaidAt: Date | null;
  operatorPaidAmount: number | null;
  alertsSent: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithProperty extends Booking {
  property: Property;
}

export interface AvailabilityCacheRow {
  id: string;
  propertyId: string;
  date: Date;
  available: boolean;
  price: number | null;
  lastFetch: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  stripeAccountId: string | null;
  stripeAccountStatus: string;
  stripeOnboardingComplete: boolean;
  stripeDetailsSubmitted: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  payoutMode: string;
  payoutSchedule: string | null;
  minimumPayout: number | null;
  bookingUrl: string | null;
  preferredContact: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatorWithCounts extends Operator {
  propertyCount: number;
  payoutCount: number;
}

export interface Payout {
  id: string;
  operatorId: string;
  amount: number;
  currency: string;
  stripeTransferId: string | null;
  stripePayoutId: string | null;
  status: string;
  bookingIds: string[];
  periodStart: Date;
  periodEnd: Date;
  failureReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
