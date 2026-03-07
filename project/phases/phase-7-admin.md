# Phase 7 — Admin (Match Queue + Overrides)

**Goal:** Build a minimal admin interface to review unmatched products, assign them to sets, create mapping overrides, and monitor ingestion health.

**Prerequisites:** Phase 6 (ingestion running, match_queue populated)

**Status: COMPLETE** ✓ Verified 2026-03-07. Supabase Studio + SQL helpers approach chosen. Migration 00008 applied. All views and functions deployed. Workflow documented in `docs/admin-workflow.md`.

---

## 1. Choose Admin Approach

- [x] Decision: **Supabase Studio + SQL helper views/functions** (no separate app)
  - Keeps admin surface minimal and outside the mobile project
  - All views/functions use `security definer` and are revoked from `anon`/`authenticated`
  - Operator access is via Supabase Studio or service-role SQL only
  - If a dedicated admin web UI is needed later, these views/functions are the correct backend primitives to reuse

## 2. Admin Authentication

- [x] Implement admin-only access via Supabase Studio (service role):
  - All admin views and functions have `REVOKE ALL ... FROM anon, authenticated`
  - No admin logic is exposed to mobile clients
  - `security definer` on all functions ensures they run with elevated privileges

## 3. Match Queue Page

- [x] `admin_match_queue_view`:
  - Columns: id, source, source_product_id, title_raw, product_url, ean, status, created_at, resolved_at, retailer_id, retailer_name, retailer_country, suggested_set_id, suggested_set_num, suggested_set_name, resolved_by
  - Filter by status / retailer via SQL WHERE
  - Sort by created_at / pagination via LIMIT + OFFSET
- [x] `admin_resolve_match_queue(queue_id, resolved_set_id, resolved_user_id)`:
  - Upserts into `offer_set_overrides`
  - Sets match_queue status = 'resolved', resolved_by, resolved_at
- [x] `admin_ignore_match_queue(queue_id, resolved_user_id)`:
  - Sets status = 'ignored'
- [x] Documented batch patterns in `docs/admin-workflow.md`

## 4. Override Management

- [x] `admin_offer_overrides_view`:
  - Columns: id, retailer_id, retailer_name, retailer_country, source_product_id, set_id, set_num, set_name, created_by, created_at
  - Filter by retailer / set via SQL WHERE
- [x] `admin_delete_override(override_id)`:
  - Deletes the override with existence check

## 5. Health Dashboard

- [x] `admin_ingestion_latest_view`:
  - Latest run per source with duration_seconds and health_color (green/yellow/red)
  - Green: success within 24h; Yellow: any run within 48h; Red: nothing in 48h
- [x] `admin_ingestion_history_view`:
  - Full run history with duration_seconds, orderable/filterable via SQL
- [x] `admin_dashboard_stats_view`:
  - total_sets, total_active_offers, open_match_queue_items, last_best_prices_refresh_at

---

## Verification

- [x] Admin views/functions deployed — migration 00008 applied successfully
- [x] `admin_match_queue_view` shows unresolved products (populated after ingestion runs)
- [x] `admin_resolve_match_queue()` creates an override and resolves the queue item
- [x] Override persists; next ingestion auto-maps the product via `offer_set_overrides`
- [x] `admin_ignore_match_queue()` moves item out of open queue
- [x] `admin_ingestion_latest_view` + `admin_dashboard_stats_view` return accurate stats
- [x] All admin objects revoked from `anon` and `authenticated` — not accessible from mobile
