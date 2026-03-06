# Phase 6 — Ingestion v1 (Daily) + Best Price Cache

**Goal:** Build the daily price ingestion pipeline that downloads retailer feeds, maps products to sets, inserts price snapshots, and recomputes cached best prices.

**Prerequisites:** Phase 1 (schema), Phase 2 (sets catalog populated)

---

## 1. Shared Edge Function Utilities

- [ ] Create `supabase/functions/_shared/env.ts`:
  - Read environment variables (feed URLs, API keys, etc.)
- [ ] Create `supabase/functions/_shared/logger.ts`:
  - Structured logging helper for Edge Functions
- [ ] Create `supabase/functions/_shared/types.ts`:
  - `NormalizedProduct` type: { source_product_id, retailer_id, title, ean, price, shipping, stock_status, product_url }
  - `IngestionResult` type: { source, offers_processed, snapshots_inserted, errors }

## 2. Bol.com Connector

- [ ] Create `supabase/functions/_shared/connectors/bol/download.ts`:
  - Download bol.com product feed (via affiliate network API or feed URL)
  - Handle authentication (API key / affiliate credentials)
  - Return raw feed data (XML/CSV/JSON depending on feed format)
- [ ] Create `supabase/functions/_shared/connectors/bol/parse.ts`:
  - Parse raw feed into structured product array
  - Filter LEGO products only (category filter or keyword match)
- [ ] Create `supabase/functions/_shared/connectors/bol/normalize.ts`:
  - Map to `NormalizedProduct` format
  - Normalize price to EUR numeric
  - Normalize shipping (null if unknown/free)
  - Normalize stock status to `in_stock | out_of_stock | unknown`
  - Set retailer_id from config

## 3. Affiliate Network Connector (Awin/Daisycon/TradeTracker)

- [ ] Create `supabase/functions/_shared/connectors/awin/` (or chosen network):
  - `download.ts` — fetch product feed
  - `parse.ts` — parse feed format
  - `normalize.ts` — map to `NormalizedProduct`
- [ ] Follow same pattern as bol.com connector
- [ ] Filter for LEGO products
- [ ] Handle multiple retailers within one network feed

## 4. Set Matching / Mapping

- [ ] Create `supabase/functions/_shared/matching/extractSetNum.ts`:
  - Regex patterns to extract LEGO set number from product title:
    - Pattern: `(\d{4,6})(-\d+)?` preceded/followed by "LEGO"
    - Handle variations: "LEGO 75192", "LEGO Set 75192-1", "75192 LEGO Star Wars"
  - Return extracted set_num or null
- [ ] Create `supabase/functions/_shared/matching/resolveSetId.ts`:
  - Mapping priority:
    1. Check `offer_set_overrides` (manual overrides first)
    2. Extract set_num from title -> look up in `sets`
    3. Match by EAN if available
    4. If no match: add to `match_queue` (status: open)
  - Return set_id or null
- [ ] Create `supabase/functions/_shared/matching/matchQueue.ts`:
  - `addToMatchQueue(product)` — insert into `match_queue` if not already present
  - Deduplicate by (retailer_id, source_product_id)

## 5. Price Processing

- [ ] Create `supabase/functions/_shared/pricing/computeDelivered.ts`:
  - delivered_price = price + shipping (if shipping known)
  - If shipping null -> delivered_price = null
- [ ] Create `supabase/functions/_shared/pricing/normalizeCurrency.ts`:
  - Ensure price is EUR (all feeds should be EUR for BE/NL)
  - Strip currency symbols, handle comma/dot decimal separators

## 6. Main Ingestion Function

- [ ] Create `supabase/functions/ingest_daily_prices/index.ts`:
  - **Step 1**: Log ingestion start in `ingestion_runs` (status: running)
  - **Step 2**: Run each connector:
    - Download feed
    - Parse + filter LEGO
    - Normalize products
  - **Step 3**: For each normalized product:
    - Resolve set_id (overrides -> regex -> EAN -> match_queue)
    - If set_id found:
      - Upsert into `offers` (on conflict: retailer_id + source_product_id)
      - Update `last_seen_at`
      - Insert `price_snapshot`
    - If no match: add to `match_queue`
  - **Step 4**: Recompute `set_best_prices_daily`:
    - For each set with new snapshots today:
      - Find lowest base price per country
      - Find lowest delivered price per country
      - Upsert into `set_best_prices_daily`
  - **Step 5**: Aggregate `set_price_daily`:
    - For today's date, insert/update daily min prices per set/country
  - **Step 6**: Log completion in `ingestion_runs` (status: success, counts)
  - **Error handling**: Catch errors per connector (don't fail entire run if one connector fails), log to `ingestion_runs`

## 7. Scheduling

- [ ] Configure as Supabase scheduled function (cron):
  - Schedule: once daily (e.g., `0 6 * * *` — 6 AM UTC)
  - Timeout: sufficient for feed downloads (5-10 minutes)
- [ ] Document how to trigger manually for testing

## 8. Healthcheck Function

- [ ] Create `supabase/functions/healthcheck/index.ts`:
  - Query `ingestion_runs` for last run per source
  - Return JSON: `{ sources: [{ name, last_run, status, offers_processed }] }`
  - Return overall health status (healthy/degraded/unhealthy)

---

## Verification

- [ ] Deploy Edge Function: `supabase functions deploy ingest_daily_prices`
- [ ] Manual trigger completes without errors
- [ ] `ingestion_runs` table has a row with status: success
- [ ] `offers` table populated with new offers
- [ ] `price_snapshots` has today's snapshot rows
- [ ] `set_best_prices_daily` updated with current best prices
- [ ] `set_price_daily` has today's entry
- [ ] Unmatchable products appear in `match_queue` (status: open)
- [ ] Running ingestion twice doesn't duplicate offers (upsert works)
- [ ] Healthcheck function returns valid status
- [ ] Mobile Home screen shows updated prices after ingestion
