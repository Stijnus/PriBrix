# Phase 0 — Repo + Tooling Bootstrap

**Goal:** Scaffold the Expo project with all dependencies, configuration, and CI so that `expo start` works and the dev environment is ready.

**Prerequisites:** None (this is the first phase)

---

## 1. Repo Structure

- [x] Choose single-repo layout (as per plan Section 20.2)
- [x] Create top-level folders:
  - `src/`
  - `src/features/`
  - `src/lib/`
  - `src/components/`
  - `src/hooks/`
  - `src/types/`
  - `src/utils/`
  - `src/theme/`
  - `supabase/migrations/`
  - `supabase/functions/`
  - `supabase/seed/`
  - `scripts/`
  - `docs/`
  - `assets/`
  - `.github/workflows/`

## 2. Expo + TypeScript Init

- [x] Initialize Expo SDK 54 project with TypeScript template
- [x] Configure `app.config.ts`:
  - App name: `PriBrix`
  - Slug: `pribrix`
  - Scheme: `pribrix` (for deep linking)
  - iOS + Android bundle identifiers
- [x] Configure `tsconfig.json` with strict mode enabled
- [x] Set up Expo Router in `app/_layout.tsx`
- [x] Create placeholder `app/(tabs)/_layout.tsx` (tabs: Home, Search, My LEGO, Settings)
- [x] Create placeholder tab screens:
  - `app/(tabs)/index.tsx` (Home)
  - `app/(tabs)/search.tsx`
  - `app/(tabs)/my-lego.tsx`
  - `app/(tabs)/settings.tsx`

## 3. Dependencies

- [x] Install core dependencies:
  - `@supabase/supabase-js`
  - `@react-native-async-storage/async-storage`
  - `@tanstack/react-query`
  - `react-native-url-polyfill`
  - `zod`
- [x] Install styling dependencies:
  - `nativewind` (v4)
  - `tailwindcss`
- [x] Install chart dependencies:
  - `react-native-gifted-charts`
  - `react-native-linear-gradient`
- [x] Install utility dependencies:
  - `expo-web-browser`
- [ ] Verify all peer dependencies resolve cleanly

## 4. NativeWind v4 Configuration

- [x] Create `tailwind.config.js` using the config from `project/design-system.md` Section 7:
  - Content paths, NativeWind preset, dark mode
  - Brand colors: primary (amber/orange), accent (teal), neutral (slate)
  - Semantic colors: success, error, warning, info, price-drop, price-up, stock status
  - Typography scale (xs through 3xl with line heights)
  - Border radius tokens
- [x] Configure Babel plugin per NativeWind v4 docs (`babel.config.js`)
- [x] Add `global.css` with Tailwind directives (`@tailwind base/components/utilities`)
- [x] Import `global.css` in root layout
- [ ] Verify a test component renders with NativeWind className

## 5. Supabase Client

- [x] Create `src/lib/supabase/client.ts`:
  - Initialize Supabase client with `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Use AsyncStorage for auth persistence
  - Import `react-native-url-polyfill/auto`
- [x] Create `.env.example` with all required env vars:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_ENV` (dev|staging|prod)
  - `EXPO_PUBLIC_DEFAULT_COUNTRY` (BE|NL)
  - `EXPO_PUBLIC_API_BASE_URL` (optional)
  - `EXPO_PUBLIC_POSTHOG_KEY` (optional)
  - `EXPO_PUBLIC_SENTRY_DSN` (optional)
- [x] Add `.env` to `.gitignore`

## 6. React Query Setup

- [x] Create `src/lib/queryClient.ts`:
  - Configure default staleTime, retry, refetchOnWindowFocus
- [x] Wrap app root with `QueryClientProvider` in `app/_layout.tsx`

## 7. Auth Session Provider

- [x] Create `src/lib/auth/session.tsx`:
  - React Context for auth state (user | null)
  - `onAuthStateChange` listener
  - Export `useSession()` hook
- [x] Wrap app root with `SessionProvider`

## 8. Local Storage Utilities

- [x] Create `src/lib/storage/keys.ts`:
  - Define AsyncStorage key constants (`local_watchlist`, `local_wishlist`, `local_owned`, `user_preferences`)
- [x] Create `src/lib/storage/localLists.ts`:
  - `getLocalWatchlist()` / `setLocalWatchlist()`
  - `getLocalWishlist()` / `setLocalWishlist()`
  - `getLocalOwned()` / `setLocalOwned()`
  - Type-safe JSON parse/stringify helpers

## 9. Zod Validation Schemas

- [x] Create `src/lib/validation/sets.ts`:
  - `SetSchema` (id, set_num, name, theme, year, image_url, msrp_eur)
- [x] Create `src/lib/validation/offers.ts`:
  - `OfferSchema` (id, retailer_id, set_id, source_product_id, ean, product_url, title_raw)
- [x] Create `src/lib/validation/prices.ts`:
  - `PriceSnapshotSchema`
  - `BestPriceDailySchema`
  - `PriceHistoryPointSchema`
- [x] Create `src/lib/validation/alerts.ts`:
  - `AlertSchema` (id, watch_id, type, threshold_price, threshold_percent, cooldown_hours)
  - `AlertEventSchema`
- [x] Create `src/lib/validation/lists.ts`:
  - `WatchlistItemSchema`
  - `WishlistItemSchema`
  - `OwnedSetSchema`
  - `LocalWatchItemSchema` / `LocalWishlistItemSchema` / `LocalOwnedItemSchema`

## 10. Mock Fixtures

- [x] Create `src/lib/mock/fixtures/sets.ts`:
  - 10 sample LEGO sets with realistic data
- [x] Create `src/lib/mock/fixtures/offers.ts`:
  - Sample offers for the 10 sets (2-3 retailers each)
- [x] Create `src/lib/mock/fixtures/priceHistory.ts`:
  - 90-day price history arrays for a few sets
- [x] Create `src/lib/mock/fixtures/watchlist.ts`:
  - Sample watchlist items
- [x] Create `src/lib/mock/fixtures/index.ts`:
  - Barrel export all fixtures

## 11. Mock Mode Hook

- [x] Create `src/hooks/useMockMode.ts`:
  - Reads `EXPO_PUBLIC_ENV` and a `mock_mode` feature flag
  - Returns `isMockMode: boolean`
  - When true, hooks should return fixture data instead of Supabase queries

## 12. EAS Configuration

- [x] Create `eas.json` with build profiles:
  - `development` (dev client, internal distribution)
  - `preview` (internal testers)
  - `production` (store builds)

## 13. Lint + Typecheck Scripts

- [x] Add ESLint config (`.eslintrc.js` or `eslint.config.js`)
- [x] Add Prettier config (`.prettierrc`)
- [x] Add `package.json` scripts:
  - `"lint": "eslint . --ext .ts,.tsx"`
  - `"typecheck": "tsc --noEmit"`
  - `"format": "prettier --write ."`

## 14. GitHub Actions CI

- [x] Create `.github/workflows/ci.yml`:
  - Trigger: push to `main`, PRs to `main`
  - Steps: checkout -> setup Node -> install deps -> lint -> typecheck
  - Optional: run tests if test framework is added

---

## Verification

- [x] `npm install` (or `pnpm install`) completes without errors
- [x] `npx expo start` launches the app (shows placeholder tabs)
- [ ] Supabase client initializes without runtime errors (check console)
- [ ] NativeWind className renders correctly on a test component
- [x] `npm run lint` passes
- [x] `npm run typecheck` passes
- [x] CI workflow file is valid YAML
