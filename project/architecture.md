# PriBrix — Architecture Reference

This document defines the high‑level system architecture used across the PriBrix project.

## System Overview

PriBrix is a mobile-first LEGO price tracking platform focused on the Benelux market (Belgium + Netherlands).

Main components:

1. **Mobile App (Expo / React Native)**
2. **Backend (Supabase)**
3. **Data Ingestion Pipeline**
4. **Affiliate price feeds**

```
Retailer Feeds
      |
      v
Ingestion Edge Functions
      |
      v
Supabase Postgres
      |
      v
Read Optimized Tables
      |
      v
Mobile App (React Query)
```

## Backend

Primary backend: **Supabase**

Components:

- PostgreSQL database
- Row Level Security
- Edge Functions
- Scheduled jobs
- Supabase Auth

### Key tables

Core data

- sets
- retailers
- offers
- price_snapshots
- set_best_prices_daily

User data

- watchlists
- alerts
- alert_events
- user_owned_sets
- user_wishlist_sets
- user_plans

Operational tables

- ingestion_runs
- match_queue
- offer_set_overrides

## Mobile Architecture

Framework: **Expo + React Native + TypeScript**

Architecture principles:

- feature-based modules
- React Query for data fetching
- local-first storage for anonymous users

Styling: **NativeWind v4** (Tailwind CSS utility classes for React Native)

- All components use NativeWind className props
- No plain StyleSheet objects except for rare edge cases that NativeWind cannot handle
- Design tokens (colors, spacing) defined in `tailwind.config.js`

Charts: **react-native-gifted-charts**

- Used for price history line charts on Set Detail screen
- Always render aggregated daily-min data (never raw snapshots)
- Wrap in a `<PriceHistoryChart />` component inside `src/features/sets/components/`

Folder concept:

```
src/
  features/
    sets/
    offers/
    watchlist/
    wishlist/
    owned/
    alerts/
```

## Data Flow

### Price ingestion

1. Download retailer feeds
2. Filter LEGO products
3. Map product to set
4. Insert offer
5. Insert price snapshot
6. Update best price cache

### Mobile queries

Mobile app does NOT scan feeds.

Client reads:

- sets
- set_best_prices_daily
- set_offers_with_latest view

## Performance Strategy

Mobile UI never queries raw snapshot tables directly.

Use:

- aggregated tables
- cached best prices

## Scaling Strategy

Expected growth:

- 10k users
- 100k tracked price points

Scaling methods:

- daily price snapshots
- aggregated history tables
- indexed Postgres queries

## Security

Row Level Security enforced for all user data.

Users can only access:

- their watchlists
- their alerts
- their collection

Public read tables:

- sets
- retailers
- set_best_prices_daily

## Deployment

Mobile builds via:

- Expo EAS

Backend:

- Supabase cloud

Edge Functions:

- Deno runtime

