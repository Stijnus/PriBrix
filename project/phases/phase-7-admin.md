# Phase 7 — Admin (Match Queue + Overrides)

**Goal:** Build a minimal admin interface to review unmatched products, assign them to sets, create mapping overrides, and monitor ingestion health.

**Prerequisites:** Phase 6 (ingestion running, match_queue populated)

---

## 1. Choose Admin Approach

- [ ] Decision: Next.js admin app (recommended) OR Supabase Studio + SQL procedures
- [ ] If Next.js:
  - Create `apps/admin/` or separate repo
  - Install: Next.js, Supabase client, Tailwind CSS
  - Configure Supabase service role key (admin-only, never exposed to client)
- [ ] If Supabase Studio:
  - Create SQL helper functions/procedures
  - Document manual workflow using Studio UI

## 2. Admin Authentication

- [ ] Implement admin-only access:
  - Option A: Check user email against allowlist
  - Option B: Add `is_admin` column to `user_plans` or separate admin table
  - Option C: Use Supabase service role key directly (simplest for single admin)
- [ ] Protect all admin routes/APIs

## 3. Match Queue Page

- [ ] Build Match Queue list view:
  - Table columns: source_product_id, title_raw, retailer, EAN, status, created_at
  - Filter by status: open / resolved / ignored
  - Filter by retailer
  - Sort by created_at (newest first)
  - Pagination
- [ ] Build Match Queue detail/resolver:
  - Show full product info (title, EAN, retailer, product URL)
  - Search sets field: search by set_num or name
  - "Assign to Set" action:
    - Set match_queue.status = 'resolved'
    - Set match_queue.resolved_by + resolved_at
    - Create `offer_set_overrides` entry (retailer_id + source_product_id -> set_id)
  - "Ignore" action:
    - Set status = 'ignored'
  - Show suggested_set_id if available (from regex partial match)
- [ ] Batch actions (optional):
  - Select multiple items -> assign to same set
  - Select multiple -> ignore

## 4. Override Management

- [ ] Build Overrides list page:
  - Table: retailer, source_product_id, mapped set_num, created_by, created_at
  - Search/filter by retailer or set
  - Delete override (with confirmation)
- [ ] Verify overrides take effect:
  - After creating override, next ingestion should auto-map the product

## 5. Health Dashboard

- [ ] Build Ingestion Health page:
  - **Last run per source**:
    - Source name, last run timestamp, status, duration
    - Offers processed, snapshots inserted
    - Error message (if failed)
  - **Overall status indicator**: green/yellow/red
    - Green: all sources ran successfully within 24h
    - Yellow: some sources failed or stale (> 24h)
    - Red: no successful run in 48h
  - **Ingestion run history**:
    - Table of recent runs (last 30 days)
    - Filter by source, status
- [ ] Build basic stats:
  - Total sets in catalog
  - Total active offers
  - Total match_queue items (open)
  - Last best_prices_daily refresh timestamp

---

## Verification

- [ ] Admin UI loads and requires authentication
- [ ] Match Queue shows unresolved products from ingestion
- [ ] Assigning a product to a set creates an override
- [ ] Override persists and next ingestion auto-maps the product
- [ ] Ignoring a product removes it from the open queue
- [ ] Health dashboard shows accurate ingestion run data
- [ ] Non-admin users cannot access admin interface
