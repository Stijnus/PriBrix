# Phase 3 — Mobile MVP (Anonymous)

**Goal:** Build the core mobile screens so anonymous users can browse sets, search, view details, manage local lists, and click affiliate links.

**Prerequisites:** Phase 0 (app scaffold), Phase 1 (schema), Phase 2 (catalog data)

---

## 1. Navigation Setup

- [x] Implement `app/_layout.tsx`:
  - Root layout with QueryClientProvider + SessionProvider
  - Stack navigator wrapping (tabs) group + modal routes
- [x] Implement `app/(tabs)/_layout.tsx`:
  - Bottom tab bar with 4 tabs: Home, Search, My LEGO, Settings
  - Icons for each tab (use Expo vector icons)
  - Active/inactive tab styling with NativeWind

## 2. Home / Browse Screen

- [x] Create `src/features/sets/api.ts`:
  - `fetchBestPricesDaily(country, page, pageSize, sort)` — query `set_best_prices_daily` joined with `sets`
- [x] Create `src/features/sets/hooks.ts`:
  - `useBestPricesDaily(country, sort)` — React Query infinite/paginated query
  - Handle mock mode: return fixtures when `isMockMode`
- [x] Create `src/features/sets/types.ts`:
  - `SetWithBestPrice` type
- [x] Implement `app/(tabs)/index.tsx` (Home screen):
  - FlatList of sets with best prices
  - Each card shows: set image, name, set_num, best price (BE + NL)
  - Pull-to-refresh
  - Pagination (infinite scroll or load more button)
  - Sort options: lowest price, newest, theme
- [x] Create `src/features/sets/components/SetCard.tsx`:
  - Reusable set card component
  - NativeWind styled
  - Tap navigates to set detail
- [x] Handle empty state: "No prices available yet"
- [x] Handle loading state: skeleton placeholders

## 3. Search Screen

- [x] Create `src/features/search/api.ts`:
  - `searchSets(query, filters)` — search `sets` by set_num (exact) + name (ILIKE/trigram)
- [x] Create `src/features/search/hooks.ts`:
  - `useSearchSets(query)` — React Query with debounced input
- [x] Implement `app/(tabs)/search.tsx`:
  - Search input at top (controlled, debounced 300ms)
  - Results list using `SetCard` component
  - Empty state: "Search for a LEGO set by name or number"
  - No results state: "No sets found for [query]"
- [x] Optional: add filters (theme, year, price range) — can defer to later

## 4. Set Detail Screen

- [x] Create route `app/set/[setNum].tsx`:
  - Dynamic route by set number
- [x] Create `src/features/sets/api.ts` (extend):
  - `fetchSetDetail(setNum)` — query set + offers from `set_offers_with_latest` view
  - For MVP: direct Supabase queries (Phase 4 replaces with Edge Function)
- [x] Create `src/features/sets/hooks.ts` (extend):
  - `useSetDetail(setNum)` — React Query hook
- [x] Implement Set Detail screen:
  - **Header section**: set image, name, set_num, theme, year
  - **Best price section**: best price BE, best price NL (from `set_best_prices_daily`)
  - **Price mode toggle**: base price vs delivered price
  - **Offers list**: retailer name, price, shipping, stock status, "Buy" button
  - **Price history chart placeholder**: empty chart area (data comes in Phase 4)
  - **List actions**: "Add to Watchlist" / "Add to Wishlist" / "Add to Collection" buttons
- [x] Create `src/features/sets/components/OfferRow.tsx`:
  - Retailer name + logo placeholder
  - Price display (base + delivered when available)
  - Stock status badge
  - "Buy" / affiliate link button
- [x] Create `src/features/sets/components/PriceHistoryChart.tsx` (stub):
  - Placeholder using `react-native-gifted-charts`
  - Accept `data: { date: string, price: number }[]` prop
  - Render "No history data" when empty
  - Period selector: 30d / 90d / 365d (non-functional until Phase 4)

## 5. Affiliate Link Handling

- [x] Create `src/lib/affiliate/openLink.ts`:
  - Use `WebBrowser.openBrowserAsync(url)` (NOT `Linking.openURL`)
  - Accept offer URL + metadata for tracking
- [x] Create `src/lib/analytics/events.ts`:
  - `trackAffiliateClick(setNum, retailer, price)` — stub for now
  - Log to console in dev; wire to analytics later (Phase 10)
- [x] Wire "Buy" button in `OfferRow` to `openLink`

## 6. My LEGO Screen (Local Lists)

- [x] Implement `app/(tabs)/my-lego.tsx`:
  - Top tab bar: Owned / Wishlist / Watching
  - Use local state tab switcher (or nested navigator)
- [x] Create `src/features/owned/hooks.ts`:
  - `useLocalOwned()` — read/write AsyncStorage via `localLists.ts`
  - Returns `{ items, addItem, removeItem, updateItem }`
- [x] Create `src/features/owned/components/OwnedList.tsx`:
  - List of owned sets (set image, name, quantity, condition)
  - Swipe-to-delete or remove button
  - Empty state: "No sets in your collection yet"
- [x] Create `src/features/wishlist/hooks.ts`:
  - `useLocalWishlist()` — read/write AsyncStorage
  - Returns `{ items, addItem, removeItem, updateItem }`
- [x] Create `src/features/wishlist/components/WishlistList.tsx`:
  - List of wishlist sets (set image, name, priority)
  - Empty state: "Your wishlist is empty"
- [x] Create `src/features/watchlist/hooks.ts`:
  - `useLocalWatchlist()` — read/write AsyncStorage
  - Returns `{ items, addItem, removeItem }`
- [x] Create `src/features/watchlist/components/WatchlistList.tsx`:
  - List of watched sets (set image, name, current best price)
  - Empty state: "Start watching sets to track prices"

## 7. Add-to-List Modal

- [x] Create `app/modal/add-to-list.tsx`:
  - Shown when user taps "Add to..." on Set Detail
  - Options: "Add to Watchlist", "Add to Wishlist", "Add to Collection"
  - For Owned: quantity picker, condition selector
  - For Wishlist: priority picker
  - Saves to local storage
  - Confirmation toast/feedback

## 8. Settings Screen

- [x] Implement `app/(tabs)/settings.tsx`:
  - **Default country**: toggle between BE / NL
  - **Show delivered price**: toggle on/off
  - Save preferences to AsyncStorage
- [x] Create `src/lib/storage/preferences.ts`:
  - `getPreferences()` / `setPreferences()`
  - Type: `{ country: 'BE' | 'NL', showDeliveredPrice: boolean }`
- [x] Create `src/hooks/usePreferences.ts`:
  - Hook that reads/writes preferences
  - Provide context or use React Query for reactivity

## 9. Shared UI Components

- [x] Create `src/components/ui/LoadingSkeleton.tsx`
- [x] Create `src/components/ui/EmptyState.tsx`
- [x] Create `src/components/ui/ErrorState.tsx`
- [x] Create `src/components/ui/Badge.tsx` (stock status, priority, etc.)
- [x] Create `src/components/ui/PriceDisplay.tsx` (formatted EUR price)

---

## Verification

- [x] Home screen loads and shows set cards with prices (infinite scroll + pull-to-refresh + sort)
- [x] Search finds sets by name and set number (debounced 300ms, trigram + ILIKE)
- [x] Set Detail shows offers with prices and retailer info (OfferRow with stock status badges)
- [x] "Buy" button opens affiliate link in in-app browser (WebBrowser.openBrowserAsync)
- [x] Can add/remove sets to all 3 local lists (Watchlist, Wishlist, Owned via AsyncStorage)
- [x] My LEGO screen shows all 3 tabs with correct data (parallel set detail fetches per tab)
- [x] Settings country toggle persists across app restarts (AsyncStorage + Zod validation)
- [x] App handles missing data gracefully (EmptyState, ErrorState, LoadingSkeleton components)
- [x] All screens styled with NativeWind (no raw StyleSheet usage)
