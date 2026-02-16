# Mt Baw Baw Apartments - Booking Aggregator Platform

A modern booking aggregator and checkout platform for Mt Baw Baw apartment rentals, built with Next.js 15, TypeScript, and Stripe.

## 🎯 Overview

This platform serves as a booking aggregator that:
- Lists accommodation options with photos, features, and pricing
- Allows guests to search by dates and guest count
- Shows real-time availability across multiple operators
- Takes payment via Stripe with a 15-25% markup
- **Phase 2:** Automated operator payouts via Stripe Connect
- **Phase 2:** Operator management and onboarding dashboard
- Automatically alerts you of new bookings for manual operator booking
- Provides admin dashboard for booking and operator management

## 🏗️ Architecture

### Tech Stack

- **Frontend & Backend**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe Checkout, Webhooks & Connect (Phase 2)
- **Styling**: Tailwind CSS
- **Email**: Nodemailer (SMTP)
- **Notifications**: Slack Webhooks (optional)

### Project Structure

```
mtbawbawapartments/
├── app/                          # Next.js 15 app router
│   ├── page.tsx                  # Home page with property grid
│   ├── property/[slug]/          # Property detail pages
│   ├── booking/                  # Booking success/cancelled pages
│   ├── admin/                    # Admin dashboard
│   │   ├── bookings/             # Booking management
│   │   └── operators/            # Operator management (Phase 2)
│   └── api/                      # API routes
│       ├── checkout/             # Stripe checkout session creation
│       ├── operators/            # Operator CRUD (Phase 2)
│       └── webhooks/stripe/      # Stripe webhook handler
├── components/                   # React components
│   ├── PropertyGrid/             # Property listing components
│   ├── DatePicker/               # Search form
│   ├── BookingForm/              # Booking form
│   └── AdminDashboard/           # Admin components
├── lib/                          # Backend logic
│   ├── db/                       # Prisma client
│   ├── stripe/                   # Stripe integration
│   │   ├── index.ts              # Standard checkout
│   │   └── connect.ts            # Stripe Connect (Phase 2)
│   ├── connectors/               # Availability connectors
│   │   ├── base.ts               # Base connector interface
│   │   ├── manual.ts             # Manual availability management
│   │   └── sirvoy.ts             # Sirvoy iCal integration
│   ├── services/                 # Business logic services
│   │   ├── availability.ts       # Availability checking & caching
│   │   └── alerts.ts             # Email & Slack notifications
│   └── utils/                    # Utilities
├── prisma/                       # Database schema
│   └── schema.prisma
└── .env.example                  # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (test mode OK for development)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd mtbawbawapartments
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mtbawbawapartments"

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # From Stripe CLI or webhook settings

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (optional - for booking alerts)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Mt Baw Baw Apartments <noreply@mtbawbawapartments.com>"
ADMIN_EMAIL="admin@mtbawbawapartments.com"

# Slack (optional)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

4. **Set up the database**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Prisma Studio to add properties
npm run db:studio
```

5. **Run the development server**

```bash
npm run dev
```

Visit http://localhost:3000

### Stripe Webhook Setup (Development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copy the webhook signing secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## 📊 Database Schema

### Key Models

- **Property**: Apartment listings with operator details and connector configuration
- **Booking**: Customer bookings with pricing breakdown and status tracking
- **AvailabilityCache**: Cached availability data from connectors
- **User**: Admin users (for future authentication)
- **SystemConfig**: System-wide configuration

## 🔌 Availability Connectors

The platform uses a pluggable connector system to integrate with different booking sources:

### Supported Connectors

1. **Manual Connector** (`manual`)
   - Relies on manual availability updates in the database
   - Good for properties without automated availability

2. **Sirvoy Connector** (`sirvoy`)
   - Integrates via iCal feed
   - Reads bookings from Sirvoy calendar
   - Configuration: `{ "icalUrl": "https://..." }`

### Adding a New Connector

1. Create a new file in `lib/connectors/` (e.g., `mycustom.ts`)
2. Extend the `BaseConnector` class
3. Implement required methods:
   - `checkAvailability(dateRange)`: Check if available for dates
   - `fetchCalendar(startDate, endDate)`: Fetch availability calendar
   - `validateConfig()`: Validate connector configuration
   - `getName()`: Return connector name

4. Register it in `lib/connectors/index.ts`:

```typescript
import { MyCustomConnector } from './mycustom';
ConnectorFactory.register('mycustom', MyCustomConnector);
```

## 💰 Pricing & Markup

### How Pricing Works

1. **Base Price**: Property's nightly rate from operator
2. **Markup**: Your commission (default 20%, configurable per property)
3. **Total Price**: `base_price * (1 + markup_percent/100)`
4. **Stripe Fee**: ~2.9% + $0.30
5. **Net Profit**: `markup - stripe_fee`

### Setting Up Properties

Add properties via Prisma Studio or directly in the database:

```typescript
{
  name: "Mt Baw Baw Apartments - Sirvoy",
  slug: "mt-baw-baw-sirvoy",
  description: "Luxury apartment...",
  sleeps: 6,
  bedrooms: 3,
  bathrooms: 2,
  features: ["Wi-Fi", "Parking", "Kitchen", "Ski-in/Ski-out"],
  images: ["https://..."],
  basePrice: 250,
  markupPercent: 20,

  // Operator details
  operatorName: "Mt Baw Baw Apartments",
  operatorContact: "0400 123 456",
  operatorEmail: "bookings@mtbawbawapartments.com.au",
  operatorBookingUrl: "https://sirvoy.me/...",

  // Connector config
  connectorType: "sirvoy",
  connectorConfig: {
    icalUrl: "https://www.sirvoy.me/ical/..."
  }
}
```

## 📧 Booking Alerts

When a booking is confirmed, the system sends alerts via:

1. **Email** (if SMTP configured)
   - Sent to `ADMIN_EMAIL`
   - Includes all booking details
   - Direct link to admin dashboard

2. **Slack** (if webhook URL configured)
   - Formatted message with booking details
   - Action button to view in admin

## 🔐 Admin Dashboard

Access at `/admin` (currently no authentication - add auth before production!)

### Features

- Dashboard with stats (total bookings, revenue, profit)
- Bookings list with filters
- Booking detail pages with:
  - Guest information
  - Financial breakdown
  - Operator contact details
  - Action buttons (mark confirmed, cancel, etc.)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Hosting

Use a managed PostgreSQL service:
- **Vercel Postgres** (easiest with Vercel)
- **Supabase** (free tier available)
- **Railway** (simple setup)
- **AWS RDS** (production-grade)

### Stripe Production Setup

1. Switch to live mode API keys
2. Set up production webhooks in Stripe Dashboard:
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Update `STRIPE_WEBHOOK_SECRET` with production secret

## 📝 Operational Workflow

### When a Booking Comes In

1. ✅ Payment succeeds via Stripe
2. 📧 You receive email + Slack alert
3. 🔍 Check admin dashboard at `/admin/bookings/[id]`
4. 📞 **ACTION REQUIRED**: Book with operator
   - Pay operator the base price (shown in dashboard)
   - Get operator confirmation number
5. ✅ Mark booking as "Confirmed" in admin
6. 📧 Send guest check-in details (manual or automated)

### Regular Maintenance

- **Refresh availability cache**: Run for each property every ~15 minutes
- **Monitor failed bookings**: Check admin for payment failures
- **Reconcile operator payments**: Track which bookings have been paid

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio
```

## 🔒 Security Considerations

### Before Going Live

1. **Add Authentication**
   - Implement auth for `/admin` routes
   - Use NextAuth.js or similar

2. **Rate Limiting**
   - Add rate limiting to API routes
   - Protect against scraping/abuse

3. **Webhook Security**
   - Webhook signature verification is already implemented
   - Ensure `STRIPE_WEBHOOK_SECRET` is set correctly

4. **Environment Variables**
   - Never commit `.env.local` to git
   - Use Vercel/hosting provider's secret management

5. **Data Validation**
   - Zod schemas are used for API validation
   - Add additional validation as needed

## 📞 Support & Next Steps

### Recommended Improvements

1. **Authentication**: Add admin login (NextAuth.js + Prisma adapter)
2. **Automated Operator Booking**: API integrations where available
3. **Guest Communication**: Email templates for confirmations, reminders
4. **Analytics**: Track conversion rates, revenue, popular properties
5. **Calendar View**: Visual calendar in admin dashboard
6. **Refund Handling**: Automated refund workflow
7. **Multi-currency**: Support international guests

### Operator Partnerships

To scale beyond MVP:
1. Get written agreements with operators
2. Request API access or iCal feeds
3. Clarify cancellation policies
4. Establish payout schedules

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

Built following the booking aggregator blueprint for Mt Baw Baw Apartments.
