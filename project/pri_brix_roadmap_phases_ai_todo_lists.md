# PriBrix — Build Roadmap (Phases + AI Todo Lists)

This canvas is the **execution roadmap** for the PriBrix plan (see the main canvas for product + schema details). The goal here is simple: **a phased checklist that a coding AI can follow** without guessing.

---

## How to use this roadmap
- Build **top → bottom**.
- Each phase has:
  - **Deliverables** (what must exist)
  - **Definition of Done** (what “finished” means)
  - **AI Todo list** (actionable tasks)
  - **Key prompts** (optional copy-paste instructions for a coding AI)

---

# Phase 0 — Repo + Tooling Bootstrap

## Deliverables
- Repo scaffold (monorepo or single-repo)
- Expo app boots locally
- Supabase project created + env wiring works
- CI basics (typecheck/lint)

## Definition of Done
- `pnpm i` / `npm i` works
- `expo start` launches app
- Supabase client initializes without runtime errors
- CI runs on main branch (lint + typecheck)

## AI Todo list
1. Create repo structure (choose monorepo or single-repo).
2. Initialize Expo SDK 54 + Expo Router + TypeScript strict.
3. Add dependencies:
   - `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `@tanstack/react-query`, `react-native-url-polyfill`, `zod`.
   - `nativewind`, `tailwindcss` (styling).
   - `react-native-gifted-charts`, `react-native-linear-gradient` (charts).
   - `expo-web-browser` (affiliate links).
4. Configure NativeWind v4:
   - `tailwind.config.js` with brand color tokens.
   - Babel plugin setup per NativeWind v4 docs.
5. Add starter files from the plan:
   - `.env.example`, `eas.json`, `app.config.ts`, `src/lib/supabase/client.ts`, `src/lib/queryClient.ts`, `src/lib/auth/session.tsx`, `src/lib/storage/*`.
6. Add Zod validation schemas in `src/lib/validation/` (sets, offers, prices, alerts, lists).
7. Add mock fixtures in `src/lib/mock/fixtures/` (10 sets, offers, 90d price history, watchlist).
8. Add `useMockMode()` hook that reads `EXPO_PUBLIC_ENV` and the `mock_mode` feature flag.
9. Add lint + typecheck scripts.
10. Add GitHub Actions workflow:
    - install → lint → typecheck → tests (optional).

## AI prompt (Phase 0)
```text
Implement Phase 0. Create the repo scaffold, install dependencies (including NativeWind v4, react-native-gifted-charts, expo-web-browser), configure NativeWind with brand color tokens, add the baseline files (supabase client, query client, session provider, localLists), add Zod validation schemas, add mock fixtures for dev mode, configure Expo Router, and create a GitHub Action that runs lint + typecheck. Ensure `expo start` works.
```

---

# Phase 1 — Supabase Schema + RLS + Seed

## Deliverables
- All core tables created (sets, retailers, offers, snapshots, caches)
- User tables created (watchlists, wishlist, owned, alerts, tokens, plans)
- RLS policies enforced
- Seed scripts exist

## Definition of Done
- Running the SQL creates all tables without errors
- Anonymous can **read**: `sets`, `retailers`, `set_best_prices_daily`
- Users can only read/write their own lists
- Service role is required for ingestion writes

## AI Todo list
1. Create `supabase/migrations/` and add migrations:
   - Core SQL (tables + indexes + views + RLS)
   - Additional SQL (match_queue, overrides, set_price_daily, ingestion_runs, feature_flags)
2. Add seed script(s):
   - Minimal retailers seed (BE/NL placeholders)
   - Optional: test sets seed (10 sets)
3. Add a migration verification doc:
   - How to apply migrations to staging/prod
4. Validate RLS with quick tests:
   - anon select sets works
   - anon cannot insert watchlist
   - authed user can CRUD their watchlists

## AI prompt (Phase 1)
```text
Implement Phase 1. Create Supabase migrations from the plan, including core tables, views, RLS, and the additional ops/matching tables. Add seed scripts and basic RLS verification queries.
```

---

# Phase 2 — Catalog Import (Rebrickable) + Sync Job

## Deliverables
- Set catalog importer (script or Edge Function)
- `public.sets` filled with real data
- Periodic sync mechanism (manual now; scheduled later)

## Definition of Done
- Import inserts/updates thousands of sets successfully
- Idempotent (running twice does not duplicate)
- Basic search works against set numbers + names

## AI Todo list
1. Create `scripts/import-sets/`:
   - Fetch Rebrickable sets (API key via env)
   - Normalize → upsert into `public.sets`
2. Add optional enrichment hook:
   - Brickset enrichment script (optional)
3. Add a “catalog sync” manual command:
   - `pnpm import:sets`

## AI prompt (Phase 2)
```text
Implement Phase 2. Add a Rebrickable importer that upserts into `public.sets` (idempotent). Provide a CLI script and docs. Add a minimal search test query to confirm it works.
```

---

# Phase 3 — Mobile MVP (Anonymous)

## Deliverables
- Tabs: Home, Search, My LEGO, Settings
- Set Detail screen
- Local lists (watchlist/wishlist/owned) stored in AsyncStorage
- Affiliate clickout plumbing (event + external link)

## Definition of Done
- Anonymous users can:
  - browse best prices (mock or real)
  - search sets
  - open set detail
  - add/remove sets to local lists
- UI handles missing data gracefully (no price, no shipping)

## AI Todo list
1. Implement navigation:
   - `app/(tabs)/_layout.tsx` + screens
2. Build **Home/Browse** screen:
   - Query `set_best_prices_daily` + `sets`
   - Pagination + sorting
3. Build **Search** screen:
   - Search by `set_num` exact, name partial
4. Build **Set Detail** screen:
   - For MVP: direct queries OR placeholder Edge Function call
   - Show offers list + best price(s)
5. Build **My LEGO** screen:
   - Local Owned/Wishlist/Watching tabs (client-only)
6. Build **Settings**:
   - Default country + delivered toggle
7. Add tracking:
   - `affiliate_click` event

## AI prompt (Phase 3)
```text
Implement Phase 3. Build the anonymous mobile MVP using Expo Router + React Query. Implement Home/Browse, Search, Set Detail, My LEGO (local-only), and Settings. Use AsyncStorage for local lists and add affiliate click handling.
```

---

# Phase 4 — Edge Function: get_set_detail + Aggregated History

## Deliverables
- `get_set_detail` Edge Function
- History comes from `set_price_daily` (not raw snapshots)

## Definition of Done
- One client call returns:
  - set metadata
  - current offers
  - best price (base + delivered)
  - daily-min history array
- P95 response time acceptable for mobile (keep payload small)

## AI Todo list
1. Implement Edge Function `get_set_detail`:
   - Input: `set_num`, `country`, `include_history_days`
   - Output: set + offers + best + history
2. Add server-side validation (Zod)
3. Update Set Detail screen to use the function

## AI prompt (Phase 4)
```text
Implement Phase 4. Create the `get_set_detail` Supabase Edge Function with validated input/output. Use the `set_offers_with_latest` view for offers and `set_price_daily` for history. Update the mobile Set Detail screen to use this function.
```

---

# Phase 5 — Auth + Sync + Migration

## Deliverables
- Auth screens (magic link)
- Server tables used for lists when logged in
- Local→server migration on first login

## Definition of Done
- Logged-out: lists stored locally
- Logged-in: lists stored in Supabase (RLS protected)
- On login: migration runs once, then local keys cleared

## AI Todo list
1. Implement Auth UI:
   - email magic link input screen
   - verify/waiting screen with "Resend" button (60s cooldown)
   - expired link error screen: "This link has expired. Request a new one."
   - deep link config in `app.config.ts` (scheme: `pribrix`, redirect: `pribrix://auth/verify`)
   - Supabase dashboard: set Site URL to `pribrix://` and redirect URL to `pribrix://auth/verify`
2. Add "Enable alerts → create account" funnel CTA
3. Implement list APIs in feature modules:
   - `watchlists`, `user_wishlist_sets`, `user_owned_sets`
4. Integrate migration utility (already in plan) into login flow
5. Add "sign out" behavior:
   - clear local lists after successful migration

## AI prompt (Phase 5)
```text
Implement Phase 5. Add Supabase Auth (magic link) with auth screens, then implement server-backed lists for logged-in users. Wire in the local-to-server migration on first login and clear AsyncStorage keys after success.
```

---

# Phase 6 — Ingestion v1 (Daily) + Best Price Cache

## Deliverables
- `ingest_daily_prices` scheduled job
- 1–2 connectors (bol + 1 affiliate network)
- `set_best_prices_daily` recompute
- `set_price_daily` aggregation
- `ingestion_runs` logging

## Definition of Done
- Running ingestion:
  - upserts offers
  - inserts snapshots
  - updates caches
  - logs run success/failure
- Match failures go to `match_queue`

## AI Todo list
1. Implement connector folder:
   - download → parse → normalize
2. Implement mapping order:
   - overrides → set_num regex → match_queue
3. Insert snapshots + update last_seen
4. Recompute:
   - `set_best_prices_daily`
   - `set_price_daily`
5. Log run to `ingestion_runs`
6. Create a `healthcheck` function to report last run timestamps

## AI prompt (Phase 6)
```text
Implement Phase 6. Build `ingest_daily_prices` as a Supabase scheduled Edge Function. Add one connector (bol) and one affiliate-network connector. Normalize items, map to sets (overrides first), insert snapshots, update caches, aggregate daily history, and log runs.
```

---

# Phase 7 — Admin (Match Queue + Overrides)

## Deliverables
- Admin UI (minimal) for:
  - match_queue review
  - set assignment
  - override creation
- Retailer health page

## Definition of Done
- Admin can resolve an open match_queue item → assigns set_id
- Override is persisted and next ingest auto-maps

## AI Todo list
1. Choose admin approach:
   - Next.js admin app (recommended)
   - Or Supabase Studio views + SQL helper procedures
2. Build pages:
   - Match Queue table + detail
   - Resolver action: mark resolved + create override
   - Health dashboard: ingestion_runs + last success per source

## AI prompt (Phase 7)
```text
Implement Phase 7. Create a minimal admin interface to manage match_queue and offer_set_overrides. Include a health page showing ingestion_runs status and last successful ingest per source.
```

---

# Phase 8 — Alerts v1 (Free) + Push

## Deliverables
- Push token registration
- `run_alerts_after_ingest` function
- Alert history UI

## Definition of Done
- After ingestion, alerts trigger and push is sent
- Cooldown respected
- `alert_events` populated

## AI Todo list
1. Mobile:
   - register Expo push token after login
   - store in `push_tokens`
2. Server:
   - implement `run_alerts_after_ingest`
   - evaluate `below_base_price`
   - insert `alert_events`
   - send push via Expo Push API
3. UI:
   - Alerts screen reads `alert_events`

## AI prompt (Phase 8)
```text
Implement Phase 8. Add Expo push token registration and a server function `run_alerts_after_ingest` that evaluates below_base_price alerts, writes alert_events, applies cooldown, and sends push notifications. Build an Alerts screen showing history.
```

---

# Phase 9 — Premium v1 (Entitlements + Paywall)

## Deliverables
- Entitlement model enforced (watchlist limits, history length)
- Paywall screen
- Subscription plumbing (start with Stripe web checkout OR stub entitlements)

## Definition of Done
- Free users are limited by rules (e.g., 20 watch items)
- Premium unlocks:
  - unlimited watchlist
  - 365d history
  - multiple alert types (optional later)

## AI Todo list
1. Implement Paywall UI + feature gating
2. Implement server-side plan checks:
   - `user_plans` reading
3. Enforce limits in UI + server writes
4. (Optional now) Stripe checkout integration

## AI prompt (Phase 9)
```text
Implement Phase 9. Add premium entitlements using user_plans. Create a paywall screen and enforce free-tier limits (watchlist cap, history days). Premium unlocks unlimited watchlist and 365-day history.
```

---

# Phase 10 — Store Readiness (Legal, QA, Release)

## Deliverables
- Privacy policy + terms + affiliate disclosure screens
- Crash reporting (Sentry)
- Basic analytics
- EAS build profiles + store metadata checklist

## Definition of Done
- App passes internal QA
- Has legal pages accessible in Settings
- No forbidden trademark claims
- Release candidate build succeeds

## AI Todo list
1. Add Settings screens:
   - Privacy Policy
   - Terms
   - Affiliate disclosure
   - Delete account/data flow
2. Add Sentry (optional but recommended)
3. Add basic analytics events
4. Create release checklist doc

## AI prompt (Phase 10)
```text
Implement Phase 10. Add legal/disclosure screens, account deletion flow, crash reporting, and a release checklist. Ensure the app store listing uses a non-affiliation disclaimer.
```

---

# Cross-cutting Workstreams (always-on)

## A) UX Polish
- Loading skeletons
- Empty states
- Error states
- Consistent typography + spacing

## B) Performance
- Pagination everywhere
- Avoid returning raw snapshots to mobile
- Cache busting + staleTime tuning

## C) Data correctness
- Price normalization
- Shipping unknown rules
- Stock status mapping

---

# Master “AI Build Queue” (Shortest path to value)
If you want the fastest MVP path:
1) Phase 0 → 1 → 2
2) Phase 3 (mock data) → Phase 4 (get_set_detail)
3) Phase 6 (ingestion) → Phase 8 (alerts)
4) Phase 5 (auth + sync)
5) Phase 10 (legal + release)
6) Phase 9 (premium)
7) Phase 7 (admin)

