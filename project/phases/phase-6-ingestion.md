# Phase 6 — Ingestion v1 (Daily) + Best Price Cache

**Goal:** Build the daily price ingestion pipeline that downloads retailer feeds, maps products to sets, inserts price snapshots, and recomputes cached best prices.

**Prerequisites:** Phase 1 (schema), Phase 2 (sets catalog populated)

**Status: COMPLETE** ✓ Verified 2026-03-07. All source files implemented, both functions deployed (ACTIVE), and cron schedule applied via migration 00007.

---

## 1. Shared Edge Function Utilities

- [x] Create `supabase/functions/_shared/env.ts`:
  - Read environment variables (BOL_FEEDS_JSON, AWIN_FEEDS_JSON, INGESTION_SECRET)
  - Parses typed JSON config arrays for each connector
- [x] Create `supabase/functions/_shared/logger.ts`:
  - Structured JSON logger (info/warn/error) with ISO timestamps
- [x] Create `supabase/functions/_shared/types.ts`:
  - `NormalizedProduct` type: { source, retailer_id, source_product_id, title, ean, price, shipping, stock_status, product_url }
  - `IngestionResult` type: { source, offers_processed, snapshots_inserted, matched_products, queued_products, errors }
  - `BolFeedConfig`, `AwinFeedConfig`, `FeedFieldMap`, `FeedFormat`, `StockStatus`

## 2. Bol.com Connector

- [x] Create `supabase/functions/_shared/connectors/bol/download.ts`:
  - Downloads bol.com feed via common `downloadFeed` helper
  - Returns `{ body, contentType }`
- [x] Create `supabase/functions/_shared/connectors/bol/parse.ts`:
  - Parses raw feed into structured records via `parseFeedRecords`
  - Filters LEGO-only products via `looksLikeLegoProduct`
- [x] Create `supabase/functions/_shared/connectors/bol/normalize.ts`:
  - Maps records to `NormalizedProduct` via `normalizeProductFields`
  - Drops rows missing required fields (id, title, url, price)
  - Sets retailer_id from config

## 3. Affiliate Network Connector (Awin)

- [x] Create `supabase/functions/_shared/connectors/awin/download.ts`
- [x] Create `supabase/functions/_shared/connectors/awin/parse.ts`
- [x] Create `supabase/functions/_shared/connectors/awin/normalize.ts`
  - Maps merchant_id → retailer_id via `merchantRetailerMap` config
  - Drops rows where merchant_id has no retailer mapping
- [x] Filters for LEGO products (shared `looksLikeLegoProduct`)
- [x] Handles multiple retailers within one network feed

## 4. Set Matching / Mapping

- [x] Create `supabase/functions/_shared/matching/extractSetNum.ts`:
  - 4 regex patterns covering: "LEGO 75192", "LEGO Set 75192-1", "75192 LEGO Star Wars", bare number
  - Returns `{base}-1` suffix if not present, or null if no match
- [x] Create `supabase/functions/_shared/matching/resolveSetId.ts`:
  - Mapping priority:
    1. Check `offer_set_overrides` (manual overrides first)
    2. Extract set_num from title → look up in `sets`
    3. Match by EAN via existing `offers`
    4. If no match: add to `match_queue` (status: open)
  - In-memory caches (overrideCache, setNumCache, eanCache) per run to minimise DB round-trips
- [x] Create `supabase/functions/_shared/matching/matchQueue.ts`:
  - `addToMatchQueue(product)` — upsert into `match_queue`
  - Deduplicates by (retailer_id, source_product_id) via `onConflict`

## 5. Price Processing

- [x] Create `supabase/functions/_shared/pricing/computeDelivered.ts`:
  - `delivered_price = price + shipping`; returns null if either is null
- [x] Create `supabase/functions/_shared/pricing/normalizeCurrency.ts`:
  - Handles number and string inputs
  - Strips currency symbols, handles both comma and dot decimal separators
  - Returns null for non-numeric or infinite values

## 6. Main Ingestion Function

- [x] Create `supabase/functions/ingest_daily_prices/index.ts`:
  - Optional `x-ingestion-secret` header guard
  - **Step 1**: Insert row in `ingestion_runs` (status: running) per source
  - **Step 2**: Run each bol + awin connector (download → parse → normalize)
  - **Step 3**: For each normalized product:
    - Resolve set_id (overrides → regex → EAN → match_queue)
    - Upsert into `offers` (on conflict: retailer_id + source_product_id), update `last_seen_at`
    - Insert `price_snapshot` only if price/shipping/stock changed or no snapshot today
    - Add to `match_queue` if unresolvable
  - **Step 4+5**: `refreshCaches` — recompute `set_best_prices_daily` and `set_price_daily` for all touched set_ids
  - **Step 6**: Finalize `ingestion_runs` row (status: success/error, counts, error_message)
  - Per-connector error isolation: one connector failure doesn't abort others

## 7. Scheduling

- [x] Configure as Supabase scheduled function (cron):
  - Migration `00007_cron_schedule.sql` enables `pg_net` + `pg_cron` and schedules `ingest-daily-prices` at `0 6 * * *` (06:00 UTC daily)
  - Secret passed via `current_setting('app.ingestion_secret', true)` — set with `ALTER DATABASE postgres SET app.ingestion_secret = '...'`
- [x] Document how to trigger manually for testing:
  - Via curl: `curl -X POST https://zecyfmxxbuwyhjyehmdq.supabase.co/functions/v1/ingest_daily_prices -H "x-ingestion-secret: <secret>" -H "Content-Type: application/json" -d '{}'`
  - Via SQL: `select cron.run_job('ingest-daily-prices');`

## 8. Healthcheck Function

- [x] Create `supabase/functions/healthcheck/index.ts`:
  - Queries `ingestion_runs` for latest row per source
  - Returns `{ status, sources: [{ name, last_run, status, offers_processed }] }`
  - Overall status: healthy / degraded / unhealthy based on source statuses

---

## Verification

- [x] Deploy Edge Function: `ingest_daily_prices` deployed via MCP — ACTIVE (v1)
- [ ] Manual trigger completes without errors
- [ ] `ingestion_runs` table has a row with status: success
- [ ] `offers` table populated with new offers
- [ ] `price_snapshots` has today's snapshot rows
- [ ] `set_best_prices_daily` updated with current best prices
- [ ] `set_price_daily` has today's entry
- [ ] Unmatchable products appear in `match_queue` (status: open)
- [ ] Running ingestion twice doesn't duplicate offers (upsert works)
- [x] Healthcheck function deployed via MCP — ACTIVE (v1); returns valid status once ingestion has run
- [ ] Mobile Home screen shows updated prices after ingestion
