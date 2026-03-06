# Phase 2 — Catalog Import (Rebrickable) + Sync Job

**Goal:** Import the LEGO set catalog from Rebrickable into `public.sets` so the app has real data to browse and search.

**Prerequisites:** Phase 1 (database schema exists)

---

## 1. Rebrickable API Client

- [x] Create `scripts/import-sets/` directory
- [x] Create `scripts/import-sets/rebrickable.ts`:
  - Fetch sets from Rebrickable API (`https://rebrickable.com/api/v3/lego/sets/`)
  - Paginate through all results (API returns 100 per page)
  - Handle rate limiting (respect Rebrickable's API limits)
  - Authenticate with `REBRICKABLE_API_KEY` from env
- [x] Create `scripts/import-sets/types.ts`:
  - `RebrickableSet` type (set_num, name, year, theme_id, num_parts, set_img_url)
  - `NormalizedSet` type (set_num, name, theme, year, image_url, msrp_eur)

## 2. Theme Resolution

- [x] Fetch themes from Rebrickable API (`/api/v3/lego/themes/`)
- [x] Build theme_id -> theme_name map
- [x] Resolve parent themes for display (e.g., "Star Wars > Buildable Figures")

## 3. Set Normalization

- [x] Create `scripts/import-sets/normalize.ts`:
  - Map Rebrickable fields to `public.sets` columns
  - set_num: use as-is (e.g., "75192-1")
  - name: use as-is
  - theme: resolve from theme_id map
  - year: use as-is
  - image_url: use `set_img_url`
  - msrp_eur: null (Rebrickable doesn't provide MSRP; fill later via Brickset or manual)

## 4. Upsert Logic

- [x] Create `scripts/import-sets/upsert.ts`:
  - Connect to Supabase using service role key
  - Upsert into `public.sets` using `set_num` as conflict key
  - Process in batches (e.g., 500 rows per upsert call)
  - Log: total fetched, inserted, updated, skipped
- [x] Ensure idempotency: running twice produces no duplicates

## 5. Main Import Script

- [x] Create `scripts/import-sets/index.ts`:
  - Orchestrate: fetch themes -> fetch sets (all pages) -> normalize -> upsert
  - Accept CLI flags: `--year-min` (filter old sets), `--dry-run`
  - Exit with code 0 on success, 1 on error
- [x] Add to `package.json` scripts:
  - `"import:sets": "npx tsx scripts/import-sets/index.ts"`

## 6. Environment Setup

- [x] Add to `.env.example`:
  - `REBRICKABLE_API_KEY="your_key_here"`
  - `SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"` (for script use only)
- [x] Document how to get a Rebrickable API key (free at rebrickable.com)

## 7. Optional: Brickset Enrichment

- [x] Create `scripts/import-sets/brickset.ts` (stub):
  - Placeholder for future MSRP enrichment
  - Brickset API can provide retail prices per region
  - Not required for MVP — document as future enhancement

---

## Verification

- [x] Run `npm run import:sets` — completes without errors
- [x] Query `SELECT count(*) FROM public.sets` — returns 26,245 rows
- [x] Run import again — row count stays the same (idempotent)
- [x] Search query works: `SELECT * FROM sets WHERE name ILIKE '%star wars%' LIMIT 5`
- [x] Exact match works: `SELECT * FROM sets WHERE set_num = '75192-1'` → Millennium Falcon
- [x] Theme column is populated with parent hierarchy (e.g., "Star Wars > Ultimate Collector Series")
