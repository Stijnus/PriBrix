# Phase 1 — Supabase Schema + RLS + Seed

**Goal:** Create all database tables, indexes, views, RLS policies, and seed data in Supabase so the backend is ready for the mobile app.

**Prerequisites:** Phase 0 (repo exists, Supabase project created)

---

## 1. Core Tables Migration

- [x] Create `supabase/migrations/00001_extensions_and_utils.sql`:
  - Enable `pgcrypto` extension
  - Enable `pg_trgm` extension (for fuzzy text search)
  - Create `set_updated_at()` trigger function
- [x] Create `supabase/migrations/00002_core_tables.sql`:
  - **`sets`** table:
    - Fields: id (uuid PK), set_num (text unique), name, theme, year, image_url, msrp_eur, created_at, updated_at
    - Indexes: set_num unique, name trigram (gin), theme, year
    - updated_at trigger
  - **`retailers`** table:
    - Fields: id (uuid PK), name, country (BE|NL), affiliate_network, base_url, is_active, created_at, updated_at
    - Indexes: country, is_active
    - updated_at trigger
  - **`offers`** table:
    - Fields: id (uuid PK), retailer_id (FK), set_id (FK), source_product_id, ean, product_url, title_raw, last_seen_at, created_at, updated_at
    - Unique constraint: (retailer_id, source_product_id)
    - Indexes: set_id, retailer_id, ean, last_seen, title_raw trigram
    - updated_at trigger
  - **`price_snapshots`** table:
    - Fields: id (uuid PK), offer_id (FK), price, shipping (nullable), stock_status (in_stock|out_of_stock|unknown), captured_at
    - Indexes: (offer_id, captured_at DESC), captured_at DESC
  - **`set_best_prices_daily`** table:
    - Fields: set_id (FK), country (BE|NL), best_base_price, best_base_offer_id (FK), best_delivered_price, best_delivered_offer_id (FK), updated_at
    - PK: (set_id, country)
    - Indexes: country, updated_at DESC

## 2. Views

- [x] Create `supabase/migrations/00003_views.sql`:
  - **`offer_latest_snapshot`** view:
    - DISTINCT ON (offer_id) from price_snapshots ordered by captured_at DESC
    - Calculates delivered_price_calc = price + coalesce(shipping, 0)
  - **`set_offers_with_latest`** view:
    - Joins offers + retailers + offer_latest_snapshot
    - Filters: retailer is_active = true
    - Exposes: offer_id, set_id, retailer_name, country, product_url, price, shipping, delivered_price, stock_status

## 3. User Tables Migration

- [x] Create `supabase/migrations/00004_user_tables.sql`:
  - **`watchlists`** table:
    - Fields: id (uuid PK), user_id (FK auth.users), set_id (FK), country (BE|NL|*), created_at, updated_at
    - Unique: (user_id, set_id, country)
    - Indexes: user_id, set_id
  - **`alerts`** table:
    - Fields: id (uuid PK), watch_id (FK watchlists), type (below_base_price|below_delivered_price|percent_drop_30d|lowest_90d), threshold_price, threshold_percent, cooldown_hours (1-720, default 24), is_enabled, created_at, updated_at
    - Unique: (watch_id, type)
    - Indexes: watch_id, is_enabled
  - **`alert_events`** table:
    - Fields: id (uuid PK), alert_id (FK), offer_id (FK nullable), trigger_price, triggered_at, sent_push, sent_email
    - Indexes: alert_id, triggered_at DESC
  - **`push_tokens`** table:
    - Fields: id (uuid PK), user_id (FK), expo_push_token (unique), platform (ios|android), created_at, updated_at
    - Indexes: user_id
  - **`user_owned_sets`** table:
    - Fields: id (uuid PK), user_id (FK), set_id (FK), quantity (int default 1), condition (sealed|used|incomplete), box_condition, purchase_price, purchase_date, notes, created_at, updated_at
    - Unique: (user_id, set_id)
    - Indexes: user_id, set_id
  - **`user_wishlist_sets`** table:
    - Fields: id (uuid PK), user_id (FK), set_id (FK), priority (low|medium|high), target_base_price, target_delivered_price, notes, created_at, updated_at
    - Unique: (user_id, set_id)
    - Indexes: user_id, set_id
  - **`user_plans`** table:
    - Fields: user_id (uuid PK, FK), plan (free|premium), status (active|past_due|canceled), provider, current_period_end, created_at, updated_at
  - Auto-create free plan trigger: `handle_new_user_create_plan()` on auth.users insert

## 4. Ops / Matching Tables

- [x] Create `supabase/migrations/00005_ops_tables.sql`:
  - **`match_queue`** table:
    - Fields: id (uuid PK), retailer_id (FK), source_product_id, title_raw, ean, suggested_set_id (FK nullable), status (open|resolved|ignored), resolved_by, resolved_at, created_at
    - Indexes: status, retailer_id
  - **`offer_set_overrides`** table:
    - Fields: id (uuid PK), retailer_id (FK), source_product_id, set_id (FK), created_by, created_at
    - Unique: (retailer_id, source_product_id)
  - **`set_price_daily`** table:
    - Fields: set_id (FK), country, date, min_base_price, min_delivered_price
    - PK: (set_id, country, date)
    - Index: (set_id, country, date DESC) for chart queries
  - **`ingestion_runs`** table:
    - Fields: id (uuid PK), source, started_at, finished_at, status (running|success|error), offers_processed, snapshots_inserted, error_message, created_at
  - **`feature_flags`** table (optional):
    - Fields: key (text PK), enabled, rollout_percent, allowlist_user_ids (uuid[])

## 5. RLS Policies

- [x] Create `supabase/migrations/00006_rls_policies.sql`:
  - **Public read** (SELECT for all):
    - `sets`
    - `retailers`
    - `set_best_prices_daily`
    - `offers`
    - `price_snapshots`
  - **User ownership** (SELECT/INSERT/UPDATE/DELETE where user_id = auth.uid()):
    - `watchlists`
    - `push_tokens`
    - `user_owned_sets`
    - `user_wishlist_sets`
  - **User ownership via join** (alerts via watchlists.user_id):
    - `alerts` — CRUD where watch_id belongs to auth.uid()
    - `alert_events` — SELECT where alert_id -> watchlist belongs to auth.uid()
  - **Read-only for users**:
    - `user_plans` — SELECT only (server writes)
  - **Service role only** (no user policies for writes):
    - `offers` writes
    - `price_snapshots` writes
    - `set_best_prices_daily` writes
    - `ingestion_runs`
    - `match_queue`
    - `offer_set_overrides`

## 6. Seed Data

- [x] Create `supabase/seed/seed_retailers.sql`:
  - Insert BE retailers: bol.com BE, LEGO.com BE, Amazon.nl (ships to BE), etc.
  - Insert NL retailers: bol.com NL, LEGO.com NL, Amazon.nl, etc.
  - Use placeholder data (real names, placeholder URLs)
- [x] Create `supabase/seed/seed_sets.sql` (optional):
  - Insert 10 test sets (Star Wars, City, Technic mix)
  - Realistic set_num, name, theme, year, msrp_eur

## 7. Migration Documentation

- [x] Create `docs/migrations.md`:
  - How to apply migrations locally (`supabase db reset`, `supabase migration up`)
  - How to apply to staging/prod
  - How to create new migrations

---

## Verification

- [x] Run all migrations against Supabase — no SQL errors (applied to remote: zecyfmxxbuwyhjyehmdq)
- [x] Verify anon can SELECT from `sets`, `retailers`, `set_best_prices_daily`
- [x] Verify anon CANNOT INSERT into `watchlists`
- [x] Verify authenticated user can CRUD their own watchlists
- [x] Verify authenticated user CANNOT see another user's watchlists
- [x] Verify seed data appears in retailers table (6 retailers: BE + NL)
- [x] Verify `set_offers_with_latest` view returns expected columns (14 columns confirmed)
