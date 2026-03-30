# AgriRent — Agricultural Equipment Rental Marketplace

A production-ready mobile-first Next.js PWA for renting farm equipment.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your values
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (default: `http://localhost:8000/api/v1`) |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Razorpay publishable key |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home — nearby equipment + filters
│   ├── login/page.tsx            # Google OAuth login
│   ├── complete-profile/page.tsx # Profile completion
│   ├── listing/[id]/page.tsx     # Equipment detail + booking
│   ├── add/page.tsx              # List new equipment
│   ├── profile/page.tsx          # My bookings + earnings
│   └── ai/page.tsx               # AI chat assistant
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # Wrapper with bottom nav
│   │   └── BottomNav.tsx         # Sticky bottom navigation
│   ├── equipment/
│   │   ├── EquipmentCard.tsx     # Card with image/price/distance
│   │   └── FilterBar.tsx         # URL-based category + price filters
│   ├── booking/
│   │   └── PricingBreakdown.tsx  # Days × price + platform fee
│   ├── auth/
│   │   └── AuthGuard.tsx         # Redirect unauthenticated users
│   └── ui/
│       ├── Button.tsx            # Reusable button with loading state
│       ├── Skeleton.tsx          # Shimmer skeletons
│       └── EmptyState.tsx        # Empty state with icon + CTA
├── hooks/
│   └── useGeolocation.ts         # Browser geolocation with fallback
├── lib/
│   ├── axios.ts                  # Axios instance + interceptors
│   └── utils.ts                  # formatCurrency, calculatePricing
├── store/
│   └── auth.ts                   # Zustand auth store (persisted)
└── types/
    └── index.ts                  # TypeScript interfaces
```

## Features

- **PWA** — installable, offline-capable
- **Auth** — Google OAuth → JWT → profile check
- **Home** — geolocation-based nearby equipment, URL filters
- **Booking** — date picker, dynamic pricing (days × rate + 5% fee)
- **Payments** — Razorpay online + COD, server-side verification
- **Profile** — my rentals, incoming requests, earnings dashboard
- **AI Chat** — conversational equipment advisor
- **Add Equipment** — multi-image upload form

## Design

- **Palette**: Earthy tones — sage green, clay, cream, bark
- **Typography**: Playfair Display (headings) + DM Sans (body)
- **Mobile-first**: Designed at 375px, sticky bottom nav, safe-area insets
- **Touch targets**: Minimum 48×48px interactive elements
