# Phase 4 — Edge Function: get_set_detail + Aggregated History

**Goal:** Create the `get_set_detail` Supabase Edge Function that returns set metadata, offers, best prices, and aggregated price history in a single call. Update the mobile Set Detail screen to use it.

**Prerequisites:** Phase 1 (schema), Phase 3 (Set Detail screen exists)

---

## 1. Edge Function Setup

- [x] Create `supabase/functions/get_set_detail/` directory
- [x] Create `supabase/functions/_shared/supabaseClient.ts`:
  - Initialize Supabase client with service role key for Edge Functions
  - Reusable across all Edge Functions
- [x] Create `supabase/functions/_shared/cors.ts`:
  - CORS headers helper for Edge Function responses

## 2. Input Validation

- [x] Create `supabase/functions/get_set_detail/types.ts`:
  - Input schema (Zod or manual validation — Deno runtime):
    - `set_num` (string, required)
    - `country` (string, optional, default '*', values: 'BE' | 'NL' | '*')
    - `include_history_days` (number, optional, default 90, max 365)
- [x] Validate input in handler, return 400 on invalid

## 3. Edge Function Implementation

- [x] Create `supabase/functions/get_set_detail/index.ts`:
  - **Step 1**: Fetch set metadata from `sets` by `set_num`
    - Return 404 if not found
  - **Step 2**: Fetch current offers from `set_offers_with_latest` view
    - Filter by set_id (and optionally country)
    - Order by price ASC
  - **Step 3**: Fetch best prices from `set_best_prices_daily`
    - Return best_base_price + best_delivered_price per country
  - **Step 4**: Fetch price history from `set_price_daily`
    - Filter by set_id + country + date >= (today - include_history_days)
    - Order by date ASC
    - Return as array of `{ date, min_base_price, min_delivered_price }`
  - **Step 5**: Compose response:
    ```json
    {
      "set": { ... },
      "offers": [ ... ],
      "best_prices": { "BE": { ... }, "NL": { ... } },
      "price_history": [ ... ]
    }
    ```
  - Return JSON with appropriate CORS headers

## 4. Response Optimization

- [x] Keep payload small:
  - Don't include raw snapshot data
  - Limit offers to active ones (last_seen within 7 days or stock != out_of_stock)
  - Cap history to requested days
- [x] Add response typing for mobile consumption

## 5. Mobile Integration

- [x] Update `src/features/sets/api.ts`:
  - Add `fetchSetDetailFromFunction(setNum, country, historyDays)`:
    - Call `supabase.functions.invoke('get_set_detail', { body: { ... } })`
    - Parse and validate response with Zod schema
- [x] Update `src/features/sets/hooks.ts`:
  - Update `useSetDetail(setNum)` to use the Edge Function instead of direct queries
  - Keep fallback to direct queries if function unavailable (graceful degradation)
- [x] Update Set Detail screen (`app/set/[setNum].tsx`):
  - Wire price history data to `PriceHistoryChart` component
  - Make period selector functional (30d / 90d / 365d refetches with different `include_history_days`)
  - Show best price badges per country

## 6. Price History Chart (Full Implementation)

- [x] Update `src/features/sets/components/PriceHistoryChart.tsx`:
  - Render line chart with `react-native-gifted-charts`
  - X-axis: dates (formatted as "Jan 15", "Feb 1", etc.)
  - Y-axis: price in EUR
  - Multiple lines if both base + delivered available
  - Tooltip on tap showing exact price + date
  - Period selector: 30d / 90d / 365d buttons
  - Loading state while fetching
  - "Not enough data" state when < 2 data points

---

## Verification

- [x] Edge Function deploys without errors — deployed via MCP, status ACTIVE
- [x] curl/test request returns valid JSON with all 4 sections (set, offers, best_prices, price_history)
- [x] Invalid set_num returns 404 — `{"error":"Set INVALID-999 was not found."}`
- [x] Missing/invalid input returns 400 with error message — field-level Zod errors returned
- [x] Mobile Set Detail screen shows data from Edge Function (with fallback to direct queries)
- [x] Price history chart renders with real or mock data (dual series: base + delivered)
- [x] Period selector (30d/90d/365d) triggers refetch via `historyDays` state
- [x] Response time is acceptable (< 500ms for typical set)
