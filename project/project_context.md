# PriBrix — Project Context (AI Quick Start)

This document is a **1–2 page** compressed context file meant for AI tools and new contributors. It summarizes what PriBrix is, what we’re building, and the non-negotiable rules.

---

## What is PriBrix?

**PriBrix** is a mobile app that tracks **LEGO set prices** in **Belgium (BE)** and **the Netherlands (NL)**.

Users can:

- Browse the best prices per set
- Compare prices across retailers
- Track price history (daily aggregated)
- Build a personal collection (Owned), wishlist, and watchlist
- Get alerts when a tracked set drops below a threshold

The app is **anonymous-first**:

- anonymous users use local lists stored in AsyncStorage
- login is optional until the user wants alerts/sync

Monetization:

- free with affiliate links
- premium tier (unlimited watchlist + longer history + extra alerts)

---

## Key Constraints (must follow)

1. **No retailer scraping**
   - All prices come from authorized feeds/APIs (affiliate product feeds, retailer feeds)

2. **Mobile app is read-only for pricing data**
   - Pricing ingestion runs server-side only

3. **Anonymous-first funnel**
   - Must work fully without login: browse/search/detail + local lists

4. **RLS security**
   - User data is private and enforced by Supabase Row Level Security

5. **Use cached/aggregated data**
   - Do not send raw snapshot series to the mobile app

---

## Tech Stack

Mobile:

- Expo SDK 54
- React Native 0.81
- TypeScript strict
- Expo Router
- TanStack React Query
- AsyncStorage
- NativeWind v4 (styling)
- react-native-gifted-charts (price history charts)
- expo-web-browser (affiliate link handling)

Backend:

- Supabase (Postgres + Auth + Edge Functions + Scheduled Jobs)

Data Sources:

- Set catalog: Rebrickable (primary), Brickset (optional enrichment)
- Price feeds: bol.com + affiliate networks (Awin/Daisycon/TradeTracker/etc.)

---

## Data Model (core tables)

Catalog + pricing:

- `sets`
- `retailers`
- `offers`
- `price_snapshots` (raw ingestion)
- `set_best_prices_daily` (read-optimized cache)
- `set_price_daily` (daily min history for charts)

User data:

- `watchlists`
- `alerts`
- `alert_events`
- `push_tokens`
- `user_owned_sets`
- `user_wishlist_sets`
- `user_plans`

Ops / matching:

- `match_queue`
- `offer_set_overrides`
- `ingestion_runs`

---

## Core App Screens

- **Home/Browse**: uses `set_best_prices_daily`
- **Search**: uses `sets` (set_num + name)
- **Set Detail**: uses Edge Function `get_set_detail`
- **My LEGO**: Owned/Wishlist/Watching (local-only when anon; server when logged-in)
- **Alerts**: alert config + alert_events
- **Settings**: country, delivered toggle, legal pages

---

## Edge Functions (server)

Required:

1. `get_set_detail`
   - input: set_num + country + history days
   - returns: set + offers + best price + aggregated history

2. `ingest_daily_prices` (scheduled)
   - downloads/reads feeds
   - normalizes products
   - maps to sets
   - upserts offers + inserts snapshots
   - recomputes `set_best_prices_daily` and `set_price_daily`

3. `run_alerts_after_ingest`
   - evaluates alerts against caches
   - applies cooldown
   - writes alert_events
   - sends push via Expo Push API

Optional:

- `healthcheck`

---

## Repo Conventions

- Feature-based structure under `src/features/*`
- No direct Supabase calls inside UI components
- All queries go through `api.ts` + `hooks.ts`
- All components styled with NativeWind v4 (`className` props, no inline StyleSheet except edge cases)
- All outbound affiliate links opened via `expo-web-browser` (`WebBrowser.openBrowserAsync`)
- All API inputs/outputs validated with Zod schemas from `src/lib/validation/`

See:

- `ARCHITECTURE.md`
- `AGENTS.md`
- `CONTRIBUTING.md`

---

## Build Sequence (shortest path)

1) Supabase schema + RLS
2) Rebrickable catalog import
3) Mobile anonymous MVP
4) `get_set_detail` function
5) Daily ingestion + best price cache
6) Auth + list sync + migration
7) Alerts + push
8) Release readiness (legal + QA)
9) Premium

---

## Naming & legal disclaimer

App name:

- **PriBrix**

Store listing must include:

- "PriBrix is not affiliated with or endorsed by the LEGO Group."

