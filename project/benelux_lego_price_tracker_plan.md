# PriBrix — Benelux LEGO Price Tracker — Mobile App Plan

## 1. Product Overview

A mobile application that tracks LEGO set prices across Belgium (BE) and the Netherlands (NL). The app allows users to browse sets, compare retailer prices, view historical trends, and receive alerts when prices drop below a chosen threshold.

The product is built with an anonymous-first funnel and monetized through affiliate links and a premium tier.

Core value proposition:

- Find the best LEGO price in BE/NL
- Track price drops
- Receive alerts when deals appear

---

# 2. Technology Stack

## Mobile

- React Native 0.81
- Expo SDK 54
- TypeScript (strict)
- Expo Router
- React Query / TanStack Query
- Reanimated
- AsyncStorage

## Backend

- Supabase
  - Postgres
  - Auth
  - Edge Functions
  - Scheduled jobs

## Data Sources

- LEGO catalog: Rebrickable or Brickset
- Retail price feeds:
  - bol.com
  - Awin
  - Daisycon
  - TradeTracker

---

# 3. App User Flow

## Anonymous User

User can:

- Search LEGO sets
- View prices in BE/NL
- Add sets to local watchlist (price tracking)
- Add sets to a local wishlist ("want")
- Add sets to a local collection ("owned")

Local storage used: AsyncStorage (local-first lists + preferences)

Anonymous users cannot:

- Receive push alerts
- Sync watchlists across devices

CTA shown when enabling alerts: "Create account to enable alerts"

---

## Registered User

Users gain:

- Cloud watchlist (sync across devices)
- Cloud wishlist (sync)
- Cloud collection / owned sets (sync)
- Push notifications
- Alert thresholds
- Premium entitlements (if subscribed)

Authentication methods:

- Magic link
- Email/password

Later:

- Apple login
- Google login

---

# 4. Core Screens

## 1. Home / Browse

Features:

- Featured deals
- Lowest price sets
- Trending sets

Data source: set\_best\_prices\_daily

## 2. Search

Search by:

- Set number
- Set name

Filters:

- Theme
- Year
- Price range

## 3. Set Detail

Displays:

- Set image
- Theme
- Release year

Price section:

- Best price BE
- Best price NL

Price modes:

- Base price
- Delivered price

Offer list shows:

- Retailer
- Price
- Shipping
- Affiliate link

Price history chart: 30 / 90 / 365 days

## 4. Watchlist

Shows tracked sets (price-focused)

Displays:

- current best price (base + delivered when known)
- user target price(s)
- country scope: BE / NL / either

Sort options:

- closest to target
- biggest drop
- lowest today

### Watchlist vs Wishlist vs Owned

- **Watchlist** = sets you actively track for a deal (alerts + targets)
- **Wishlist** = sets you want, but not necessarily tracking (no alerts by default)
- **Owned (Collection)** = sets you already own (inventory + optional value insights)

## 5. My LEGO (Collection & Wishlist)

A personal area with 3 tabs:

- **Owned** (collection)
- **Wishlist** (want)
- **Watching** (watchlist)

Owned tab features:

- add set to collection
- quantity (e.g., 1x, 2x)
- condition: new/sealed, used, incomplete
- box condition (optional)
- purchase price + date (optional)
- notes + tags (e.g., “gift”, “display”, “resell”)

Wishlist tab features:

- priority (low/med/high)
- optional target price (no alerts unless converted to watchlist)
- one-tap “Track this deal” (convert to watchlist + create alert)

Portfolio (premium-ready):

- total sets owned
- total MSRP (if known)
- current best market proxy (based on best retail or BrickLink stats)
- changes over time

---

## 6. Alerts

List of triggered alerts

Displays:

- set
- retailer
- triggered price

## 6. Settings

- Default country
- Delivered price toggle
- Notification preferences

---

# 5. Pricing Model

The system stores two price types:

Base price Price excluding shipping

Delivered price Price including shipping

Formula:

delivered\_price = price + shipping

If shipping unknown:

- delivered price not calculated

Ranking modes:

1. Best base price
2. Best delivered price

---

# 6. Database Schema

## sets

Fields:

- id
- set\_num
- name
- theme
- year
- image\_url
- msrp\_eur

## retailers

Fields:

- id
- name
- country
- affiliate\_network
- base\_url

## offers

Fields:

- id
- retailer\_id
- set\_id
- source\_product\_id
- ean
- product\_url
- title\_raw
- last\_seen\_at

## price\_snapshots

Fields:

- id
- offer\_id
- price
- shipping
- stock\_status
- captured\_at

## set\_best\_prices\_daily

Fields:

- set\_id
- country
- best\_base\_price
- best\_base\_offer\_id
- best\_delivered\_price
- best\_delivered\_offer\_id
- updated\_at

## watchlists

Fields:

- id
- user\_id
- set\_id
- country

## user\_owned\_sets (Collection)

Tracks sets the user owns.

Fields:

- id
- user\_id
- set\_id
- quantity (int, default 1)
- condition (sealed/used/incomplete)
- box\_condition (optional)
- purchase\_price (numeric, optional)
- purchase\_date (date, optional)
- notes (text, optional)
- created\_at

Unique:

- (user\_id, set\_id) — **v1 decision: one row per set per user**. Quantity handles multiple copies of the same set in the same condition. If a user owns both a sealed and a used copy of the same set, they use the notes field in v1. A multi-row model (separate row per condition) is planned for a future version.

## user\_wishlist\_sets

Tracks sets the user wants (not necessarily price alerts).

Fields:

- id
- user\_id
- set\_id
- priority (low/medium/high)
- target\_base\_price (numeric, optional)
- target\_delivered\_price (numeric, optional)
- notes (text, optional)
- created\_at

Unique:

- (user\_id, set\_id)

## user\_tags (optional)

Reusable tags for Owned/Wishlist items.

Fields:

- id
- user\_id
- name

## user\_item\_tags (optional)

Join table to tag owned/wishlist items.

Fields:

- id
- user\_id
- entity\_type (owned|wishlist)
- entity\_id
- tag\_id

## alerts

Fields:

- id
- watch\_id
- type
- threshold\_price
- threshold\_percent
- cooldown\_hours

## alert\_events

Fields:

- id
- alert\_id
- triggered\_at
- trigger\_price

## push\_tokens

Fields:

- user\_id
- expo\_push\_token

## user\_plans

Fields:

- user\_id
- plan
- status

---

# 7. Daily Price Ingestion Pipeline

Scheduled job runs once per day.

Steps:

1. Download retailer feeds

2. Filter LEGO products

3. Normalize prices

4. Match product to set

Matching methods:

- EAN
- set number regex
- manual review

5. Upsert offers

6. Insert price snapshots

7. Recalculate best prices

Table updated:

set\_best\_prices\_daily

---

# 8. Alert Engine

Runs after ingestion.

Steps:

1. Fetch user alerts

2. Compare best price to thresholds

3. Check cooldown

4. Insert alert event

5. Send push notification

Push service: Expo Push API

---

# 9. Monetization

## Free Tier

Features:

- search sets
- best prices
- watchlist up to 20 sets
- 1 alert per set
- 30 day history

## Premium Tier

Features:

- unlimited watchlist
- multiple alerts
- delivered price alerts
- 365 day history
- advanced insights

Premium price idea:

2.99€ / month

or

19€ / year

---

# 10. Development Phases

## Phase 1 — Data foundation (Week 1)

- Create Supabase project
- Implement core tables: sets, retailers, offers, price\_snapshots
- Implement read-optimized table: set\_best\_prices\_daily
- RLS: public read on sets + best prices
- Import initial set catalog (Rebrickable or Brickset)

## Phase 2 — Mobile v1 (Anonymous mode) (Week 2–3)

- Expo Router navigation
- Browse + Search + Set detail
- Local lists:
  - local\_watchlist
  - local\_wishlist
  - local\_owned
- UI toggles:
  - default country
  - show delivered price when available

## Phase 3 — Auth + Sync + Migration (Week 4)

- Supabase Auth (magic link + email/password)
- On login:
  - migrate local lists to server tables
  - register Expo push token
- Build “My LEGO” screen (Owned/Wishlist/Watching)

## Phase 4 — Ingestion v1 (Daily refresh) (Week 5)

- Implement connectors (start with bol + 1 network)
- Normalize products → offers + snapshots
- Recompute set\_best\_prices\_daily
- Basic admin view for mapping issues

## Phase 5 — Alerts v1 (Week 6)

- Alert types (free): below base price
- Run alerts after ingestion
- Push notifications + alert history screen

## Phase 6 — Premium (Week 7–8)

- Stripe subscriptions (or App Store / Play Billing later)
- user\_plans entitlements
- Premium features:
  - unlimited watchlist
  - multiple alerts
  - delivered-price alerts
  - 365-day history
  - portfolio insights (owned sets)

---

# 11. Future Features

- Price prediction
- Deal score
- Bundle detection
- Price heatmap per retailer
- Web dashboard
- Barcode scanning (add to owned/wishlist faster)
- Import/export (CSV)
- Shareable wishlists

---

# 12. Success Metrics

Key metrics:

- active users
- watchlist size
- wishlist size
- owned sets count
- alert conversions
- affiliate revenue
- premium conversion

Target v1:

- 10k users
- 100k tracked prices

---

# 13. Supabase SQL Skeleton (High-Level)

Below is a concise skeleton of what you’ll implement (expand into full SQL when coding).

## Core tables

- sets
- retailers
- offers
- price\_snapshots
- set\_best\_prices\_daily

## User tables

- watchlists
- alerts
- alert\_events
- push\_tokens
- user\_owned\_sets
- user\_wishlist\_sets
- user\_plans

## RLS rules (summary)

- Public read: sets, retailers, set\_best\_prices\_daily
- User-only: watchlists, alerts, alert\_events, push\_tokens, user\_owned\_sets, user\_wishlist\_sets, user\_plans
- Service role only: offers, price\_snapshots, set\_best\_prices\_daily writes

---

# 14. Edge Functions & Scheduled Jobs

## 14.1 ingest\_daily\_prices (scheduled daily)

Inputs:

- bol feed + affiliate feeds

Outputs:

- upsert offers
- insert price\_snapshots
- recompute set\_best\_prices\_daily

Key rules:

- only LEGO products
- EUR normalization
- shipping nullable
- stock status normalized

## 14.2 run\_alerts\_after\_ingest

- load active alerts
- compute best base/delivered price per set & country
- apply cooldown
- write alert\_events
- send Expo push

## 14.3 migrate\_local\_lists (optional helper)

Can be done client-side, but a function makes validation easier.

---

# 15. Admin Dashboard (Data Quality)

Minimal internal admin panel (can be a tiny Next.js app or Supabase Studio + custom view):

## 15.1 Match Queue

When ingestion can’t reliably map a product to a set:

- store it in a “match\_queue” view/table
- allow manual assignment: product → set\_id
- store mapping so future ingests auto-resolve

## 15.2 Retailer Health

- last feed fetch time
- number of offers updated
- error logs per connector

---

# 16. Scalability & Data Retention

## 16.1 Snapshot volume

Daily refresh means 1 snapshot/day per offer.

Example:

- 10,000 offers × 365 days = 3.65M rows/year (manageable in Postgres with good indexes)

## 16.2 Optimizations

- Index (offer\_id, captured\_at desc)
- Downsample history for charts (daily min) into a derived table
- Keep raw snapshots 12–24 months; keep aggregated daily mins longer

## 16.3 Caching

- set\_best\_prices\_daily is your primary cache for browse/search
- keep responses small (pagination)

---

# 17. Analytics & Monitoring

- Track ingestion success/fail per source
- Track alert send success rate
- Track affiliate click-through
- Track premium conversion funnel (anonymous → signup → alerts → premium)

---

# 18. Supabase SQL (Copy‑paste Ready)

> Paste this in **Supabase SQL Editor** (adjust names if needed). It creates tables, indexes, triggers, and RLS policies.

```sql
-- ==============================
-- Extensions
-- ==============================
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ==============================
-- Utility: updated_at trigger
-- ==============================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ==============================
-- Core tables
-- ==============================

-- 1) LEGO Set catalog
create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  set_num text not null,
  name text not null,
  theme text,
  year int,
  image_url text,
  msrp_eur numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sets_set_num_uq on public.sets(set_num);
create index if not exists sets_name_trgm_idx on public.sets using gin (name gin_trgm_ops);
create index if not exists sets_theme_idx on public.sets(theme);
create index if not exists sets_year_idx on public.sets(year);

drop trigger if exists trg_sets_updated_at on public.sets;
create trigger trg_sets_updated_at
before update on public.sets
for each row execute function public.set_updated_at();


-- 2) Retailers (BE/NL)
create table if not exists public.retailers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null check (country in ('BE','NL')),
  affiliate_network text,
  base_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists retailers_country_idx on public.retailers(country);
create index if not exists retailers_active_idx on public.retailers(is_active);

drop trigger if exists trg_retailers_updated_at on public.retailers;
create trigger trg_retailers_updated_at
before update on public.retailers
for each row execute function public.set_updated_at();


-- 3) Offers (a retailer product mapped to a LEGO set)
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references public.retailers(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  source_product_id text not null,
  ean text,
  product_url text not null,
  title_raw text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offers_unique_source unique (retailer_id, source_product_id)
);

create index if not exists offers_set_idx on public.offers(set_id);
create index if not exists offers_retailer_idx on public.offers(retailer_id);
create index if not exists offers_ean_idx on public.offers(ean);
create index if not exists offers_last_seen_idx on public.offers(last_seen_at);

-- helps search/debug
create index if not exists offers_title_trgm_idx on public.offers using gin (title_raw gin_trgm_ops);

drop trigger if exists trg_offers_updated_at on public.offers;
create trigger trg_offers_updated_at
before update on public.offers
for each row execute function public.set_updated_at();


-- 4) Price snapshots (time-series)
create table if not exists public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  price numeric(10,2) not null check (price >= 0),
  shipping numeric(10,2) check (shipping is null or shipping >= 0),
  stock_status text not null default 'unknown' check (stock_status in ('in_stock','out_of_stock','unknown')),
  captured_at timestamptz not null default now()
);

create index if not exists price_snapshots_offer_captured_idx
  on public.price_snapshots(offer_id, captured_at desc);

create index if not exists price_snapshots_captured_idx
  on public.price_snapshots(captured_at desc);


-- 5) Read-optimized daily cache: best prices per set/country
create table if not exists public.set_best_prices_daily (
  set_id uuid not null references public.sets(id) on delete cascade,
  country text not null check (country in ('BE','NL')),
  best_base_price numeric(10,2),
  best_base_offer_id uuid references public.offers(id) on delete set null,
  best_delivered_price numeric(10,2),
  best_delivered_offer_id uuid references public.offers(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (set_id, country)
);

create index if not exists set_best_prices_daily_country_idx on public.set_best_prices_daily(country);
create index if not exists set_best_prices_daily_updated_idx on public.set_best_prices_daily(updated_at desc);


-- ==============================
-- Convenience views (optional but recommended)
-- ==============================

-- Latest snapshot per offer (fast offer list)
create or replace view public.offer_latest_snapshot as
select distinct on (ps.offer_id)
  ps.offer_id,
  ps.price,
  ps.shipping,
  (ps.price + coalesce(ps.shipping, 0)) as delivered_price_calc,
  ps.stock_status,
  ps.captured_at
from public.price_snapshots ps
order by ps.offer_id, ps.captured_at desc;

-- Offer list with retailer + latest snapshot
create or replace view public.set_offers_with_latest as
select
  o.id as offer_id,
  o.set_id,
  r.id as retailer_id,
  r.name as retailer_name,
  r.country,
  o.product_url,
  o.title_raw,
  o.ean,
  ls.price,
  ls.shipping,
  case when ls.shipping is null then null else (ls.price + ls.shipping) end as delivered_price,
  ls.stock_status,
  ls.captured_at
from public.offers o
join public.retailers r on r.id = o.retailer_id
left join public.offer_latest_snapshot ls on ls.offer_id = o.id
where r.is_active = true;


-- ==============================
-- User tables (RLS-protected)
-- ==============================

-- 6) Watchlists (price tracking)
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  country text not null default '*' check (country in ('BE','NL','*')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watchlists_unique_user_set_country unique (user_id, set_id, country)
);

create index if not exists watchlists_user_idx on public.watchlists(user_id);
create index if not exists watchlists_set_idx on public.watchlists(set_id);

drop trigger if exists trg_watchlists_updated_at on public.watchlists;
create trigger trg_watchlists_updated_at
before update on public.watchlists
for each row execute function public.set_updated_at();


-- 7) Alerts
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watchlists(id) on delete cascade,
  type text not null check (
    type in (
      'below_base_price',
      'below_delivered_price',
      'percent_drop_30d',
      'lowest_90d'
    )
  ),
  threshold_price numeric(10,2),
  threshold_percent numeric(6,2),
  cooldown_hours int not null default 24 check (cooldown_hours between 1 and 720),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alerts_unique_watch_type unique (watch_id, type)
);

create index if not exists alerts_watch_idx on public.alerts(watch_id);
create index if not exists alerts_enabled_idx on public.alerts(is_enabled);

drop trigger if exists trg_alerts_updated_at on public.alerts;
create trigger trg_alerts_updated_at
before update on public.alerts
for each row execute function public.set_updated_at();


-- 8) Alert events (history)
create table if not exists public.alert_events (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  trigger_price numeric(10,2) not null,
  triggered_at timestamptz not null default now(),
  sent_push boolean not null default false,
  sent_email boolean not null default false
);

create index if not exists alert_events_alert_idx on public.alert_events(alert_id);
create index if not exists alert_events_triggered_idx on public.alert_events(triggered_at desc);


-- 9) Push tokens
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text not null check (platform in ('ios','android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_tokens_unique_token unique (expo_push_token)
);

create index if not exists push_tokens_user_idx on public.push_tokens(user_id);

drop trigger if exists trg_push_tokens_updated_at on public.push_tokens;
create trigger trg_push_tokens_updated_at
before update on public.push_tokens
for each row execute function public.set_updated_at();


-- 10) Owned sets (Collection)
create table if not exists public.user_owned_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  condition text not null default 'used' check (condition in ('sealed','used','incomplete')),
  box_condition text,
  purchase_price numeric(10,2),
  purchase_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_owned_sets_unique unique (user_id, set_id)
);

create index if not exists user_owned_sets_user_idx on public.user_owned_sets(user_id);
create index if not exists user_owned_sets_set_idx on public.user_owned_sets(set_id);

drop trigger if exists trg_user_owned_sets_updated_at on public.user_owned_sets;
create trigger trg_user_owned_sets_updated_at
before update on public.user_owned_sets
for each row execute function public.set_updated_at();


-- 11) Wishlist sets
create table if not exists public.user_wishlist_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  target_base_price numeric(10,2),
  target_delivered_price numeric(10,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_wishlist_sets_unique unique (user_id, set_id)
);

create index if not exists user_wishlist_sets_user_idx on public.user_wishlist_sets(user_id);
create index if not exists user_wishlist_sets_set_idx on public.user_wishlist_sets(set_id);

drop trigger if exists trg_user_wishlist_sets_updated_at on public.user_wishlist_sets;
create trigger trg_user_wishlist_sets_updated_at
before update on public.user_wishlist_sets
for each row execute function public.set_updated_at();


-- 12) Plans (premium entitlements)
create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','premium')),
  status text not null default 'active' check (status in ('active','past_due','canceled')),
  provider text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_plans_updated_at on public.user_plans;
create trigger trg_user_plans_updated_at
before update on public.user_plans
for each row execute function public.set_updated_at();


-- Auto-create a free plan row for every new user
create or replace function public.handle_new_user_create_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_plans (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Trigger on auth.users
-- NOTE: Supabase allows triggers on auth.users. If your project blocks it, create the row in your app after signup.
drop trigger if exists on_auth_user_created_plan on auth.users;
create trigger on_auth_user_created_plan
after insert on auth.users
for each row execute procedure public.handle_new_user_create_plan();


-- ==============================
-- Row Level Security (RLS)
-- ==============================

-- Public read tables
alter table public.sets enable row level security;
alter table public.retailers enable row level security;
alter table public.set_best_prices_daily enable row level security;

create policy "public_read_sets" on public.sets
for select using (true);

create policy "public_read_retailers" on public.retailers
for select using (true);

create policy "public_read_best_prices" on public.set_best_prices_daily
for select using (true);

-- Offers + latest snapshots: allow public read (you can remove these if you prefer Edge Functions only)
alter table public.offers enable row level security;
alter table public.price_snapshots enable row level security;

create policy "public_read_offers" on public.offers
for select using (true);

create policy "public_read_price_snapshots" on public.price_snapshots
for select using (true);

-- User tables: strict ownership
alter table public.watchlists enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_events enable row level security;
alter table public.push_tokens enable row level security;
alter table public.user_owned_sets enable row level security;
alter table public.user_wishlist_sets enable row level security;
alter table public.user_plans enable row level security;

-- watchlists
create policy "watchlists_select_own" on public.watchlists
for select using (auth.uid() = user_id);

create policy "watchlists_insert_own" on public.watchlists
for insert with check (auth.uid() = user_id);

create policy "watchlists_update_own" on public.watchlists
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "watchlists_delete_own" on public.watchlists
for delete using (auth.uid() = user_id);

-- alerts (ownership via watchlists)
create policy "alerts_select_own" on public.alerts
for select using (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

create policy "alerts_insert_own" on public.alerts
for insert with check (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

create policy "alerts_update_own" on public.alerts
for update using (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

create policy "alerts_delete_own" on public.alerts
for delete using (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

-- alert_events (ownership via alerts -> watchlists)
create policy "alert_events_select_own" on public.alert_events
for select using (
  exists (
    select 1
    from public.alerts a
    join public.watchlists w on w.id = a.watch_id
    where a.id = alert_events.alert_id
      and w.user_id = auth.uid()
  )
);

-- Usually only the server inserts alert_events.
-- If you want to allow user inserts (not recommended), add an insert policy.

-- push_tokens
create policy "push_tokens_select_own" on public.push_tokens
for select using (auth.uid() = user_id);

create policy "push_tokens_insert_own" on public.push_tokens
for insert with check (auth.uid() = user_id);

create policy "push_tokens_update_own" on public.push_tokens
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "push_tokens_delete_own" on public.push_tokens
for delete using (auth.uid() = user_id);

-- owned
create policy "owned_select_own" on public.user_owned_sets
for select using (auth.uid() = user_id);

create policy "owned_insert_own" on public.user_owned_sets
for insert with check (auth.uid() = user_id);

create policy "owned_update_own" on public.user_owned_sets
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owned_delete_own" on public.user_owned_sets
for delete using (auth.uid() = user_id);

-- wishlist
create policy "wishlist_select_own" on public.user_wishlist_sets
for select using (auth.uid() = user_id);

create policy "wishlist_insert_own" on public.user_wishlist_sets
for insert with check (auth.uid() = user_id);

create policy "wishlist_update_own" on public.user_wishlist_sets
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wishlist_delete_own" on public.user_wishlist_sets
for delete using (auth.uid() = user_id);

-- plans
create policy "plans_select_own" on public.user_plans
for select using (auth.uid() = user_id);

-- server writes only (no insert/update policies for users)

```

---

# 19. Expo TypeScript — Migrate Local Lists to Supabase (Copy‑paste)

> This migrates **local watchlist / wishlist / owned** from AsyncStorage to Supabase **after login**. Assumes you store local lists as JSON arrays under these keys:
>
> - `local_watchlist`
> - `local_wishlist`
> - `local_owned`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SupabaseClient } from '@supabase/supabase-js'

type CountryScope = 'BE' | 'NL' | '*'

type LocalWatchItem = {
  set_num: string
  country?: CountryScope
  // optional targets to auto-create alerts
  target_base_price?: number
  target_delivered_price?: number
}

type LocalWishlistItem = {
  set_num: string
  priority?: 'low' | 'medium' | 'high'
  target_base_price?: number
  target_delivered_price?: number
  notes?: string
}

type LocalOwnedItem = {
  set_num: string
  quantity?: number
  condition?: 'sealed' | 'used' | 'incomplete'
  box_condition?: string
  purchase_price?: number
  purchase_date?: string // ISO date
  notes?: string
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function fetchSetIdMap(supabase: SupabaseClient, setNums: string[]) {
  // Supabase has limits; chunk to be safe
  const chunkSize = 200
  const map = new Map<string, string>()

  for (let i = 0; i < setNums.length; i += chunkSize) {
    const chunk = setNums.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('sets')
      .select('id,set_num')
      .in('set_num', chunk)

    if (error) throw error
    for (const row of data ?? []) map.set(row.set_num, row.id)
  }

  return map
}

export async function migrateLocalListsToSupabase(supabase: SupabaseClient) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  const user = authData.user
  if (!user) return { migrated: false, reason: 'not_logged_in' as const }

  const rawWatch = await AsyncStorage.getItem('local_watchlist')
  const rawWish = await AsyncStorage.getItem('local_wishlist')
  const rawOwned = await AsyncStorage.getItem('local_owned')

  const localWatch = safeParseJson<LocalWatchItem[]>(rawWatch, [])
  const localWish = safeParseJson<LocalWishlistItem[]>(rawWish, [])
  const localOwned = safeParseJson<LocalOwnedItem[]>(rawOwned, [])

  const allSetNums = Array.from(
    new Set(
      [...localWatch, ...localWish, ...localOwned]
        .map((x) => x.set_num)
        .filter(Boolean)
    )
  )

  if (allSetNums.length === 0) {
    return { migrated: false, reason: 'nothing_to_migrate' as const }
  }

  const setIdMap = await fetchSetIdMap(supabase, allSetNums)

  // 1) Watchlists
  const watchRows = localWatch
    .map((w) => {
      const set_id = setIdMap.get(w.set_num)
      if (!set_id) return null
      return {
        user_id: user.id,
        set_id,
        country: w.country ?? '*',
      }
    })
    .filter(Boolean) as Array<{ user_id: string; set_id: string; country: CountryScope }>

  // Return watchlist IDs so we can attach alerts
  const { data: upsertedWatch, error: watchErr } = await supabase
    .from('watchlists')
    .upsert(watchRows, { onConflict: 'user_id,set_id,country' })
    .select('id,set_id,country')

  if (watchErr) throw watchErr

  // Build a lookup: (set_id + country) -> watch_id
  const watchKey = (set_id: string, country: CountryScope) => `${set_id}::${country}`
  const watchIdMap = new Map<string, string>()
  for (const row of upsertedWatch ?? []) {
    watchIdMap.set(watchKey(row.set_id, row.country), row.id)
  }

  // 1b) Create alerts from local targets (optional)
  const alertRows: Array<{
    watch_id: string
    type: string
    threshold_price?: number
    cooldown_hours?: number
  }> = []

  for (const w of localWatch) {
    const set_id = setIdMap.get(w.set_num)
    if (!set_id) continue
    const country = (w.country ?? '*') as CountryScope
    const watch_id = watchIdMap.get(watchKey(set_id, country))
    if (!watch_id) continue

    if (typeof w.target_base_price === 'number') {
      alertRows.push({
        watch_id,
        type: 'below_base_price',
        threshold_price: w.target_base_price,
        cooldown_hours: 24,
      })
    }

    if (typeof w.target_delivered_price === 'number') {
      alertRows.push({
        watch_id,
        type: 'below_delivered_price',
        threshold_price: w.target_delivered_price,
        cooldown_hours: 24,
      })
    }
  }

  if (alertRows.length > 0) {
    const { error: alertsErr } = await supabase
      .from('alerts')
      .upsert(alertRows, { onConflict: 'watch_id,type' })

    if (alertsErr) throw alertsErr
  }

  // 2) Wishlist
  const wishRows = localWish
    .map((w) => {
      const set_id = setIdMap.get(w.set_num)
      if (!set_id) return null
      return {
        user_id: user.id,
        set_id,
        priority: w.priority ?? 'medium',
        target_base_price: w.target_base_price ?? null,
        target_delivered_price: w.target_delivered_price ?? null,
        notes: w.notes ?? null,
      }
    })
    .filter(Boolean)

  if (wishRows.length > 0) {
    const { error: wishErr } = await supabase
      .from('user_wishlist_sets')
      .upsert(wishRows as any, { onConflict: 'user_id,set_id' })

    if (wishErr) throw wishErr
  }

  // 3) Owned
  const ownedRows = localOwned
    .map((o) => {
      const set_id = setIdMap.get(o.set_num)
      if (!set_id) return null
      return {
        user_id: user.id,
        set_id,
        quantity: o.quantity ?? 1,
        condition: o.condition ?? 'used',
        box_condition: o.box_condition ?? null,
        purchase_price: o.purchase_price ?? null,
        purchase_date: o.purchase_date ?? null,
        notes: o.notes ?? null,
      }
    })
    .filter(Boolean)

  if (ownedRows.length > 0) {
    const { error: ownedErr } = await supabase
      .from('user_owned_sets')
      .upsert(ownedRows as any, { onConflict: 'user_id,set_id' })

    if (ownedErr) throw ownedErr
  }

  // Optional: clear local lists once migrated
  await AsyncStorage.multiRemove(['local_watchlist', 'local_wishlist', 'local_owned'])

  return {
    migrated: true as const,
    counts: {
      watch: watchRows.length,
      wishlist: wishRows.length,
      owned: ownedRows.length,
      alerts: alertRows.length,
    },
    missing_set_nums: allSetNums.filter((n) => !setIdMap.has(n)),
  }
}
```

---

# 20. Recommended Repo & Folder Structure

A structure that scales from MVP → premium without turning into a spaghetti repo.

## 20.1 Suggested monorepo (recommended)

```
lego-price-tracker/
  apps/
    mobile/                      # Expo app
    admin/                       # Optional: Next.js admin dashboard (mapping + health)
  packages/
    shared/                      # Shared types, Zod schemas, helpers
    ui/                          # Optional: shared UI primitives (if you build admin)
  supabase/
    migrations/                  # SQL migrations (schema + RLS)
    functions/
      _shared/
        supabaseClient.ts
        env.ts
        logger.ts
        types.ts
        connectors/
          bol/
            download.ts
            parse.ts
            normalize.ts
          awin/
            download.ts
            parse.ts
            normalize.ts
          daisycon/
          tradetracker/
        matching/
          extractSetNum.ts
          resolveSetId.ts
          matchQueue.ts
        pricing/
          computeDelivered.ts
          normalizeCurrency.ts
      ingest_daily_prices/
        index.ts
      run_alerts_after_ingest/
        index.ts
      get_set_detail/
        index.ts
      healthcheck/
        index.ts
    seed/
      seed_sets.ts               # optional seed scripts
  scripts/
    import-sets/                 # Import Rebrickable/Brickset catalog
    local-dev/                   # Local tooling, feed download tests
  docs/
    api.md
    data-sources.md
    rls.md
  .github/
    workflows/
      ci.yml
  .env.example
  README.md
```

## 20.2 If you prefer single-repo (mobile + supabase only)

```
lego-price-tracker/
  app/                           # Expo Router routes
  src/
    components/
      ui/
      charts/
      layout/
    features/
      sets/
      offers/
      watchlist/
      wishlist/
      owned/
      alerts/
      auth/
      settings/
      premium/
    lib/
      supabase/
        client.ts
        auth.ts
      storage/
        keys.ts
        localLists.ts
      analytics/
      featureFlags/
      pricing/
    hooks/
    types/
    utils/
    theme/
  supabase/
    migrations/
    functions/
    seed/
  scripts/
  docs/
  assets/
  app.config.ts
  package.json
  .env.example
```

## 20.3 Expo Router route layout (mobile)

```
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx                    # Home
    search.tsx
    my-lego.tsx                  # Owned/Wishlist/Watching (tabs inside)
    alerts.tsx
    settings.tsx
  set/
    [setNum].tsx                 # Set detail
  auth/
    sign-in.tsx
    verify.tsx
  modal/
    paywall.tsx
    add-to-list.tsx
```

## 20.4 Feature module conventions (recommended)

Each feature folder follows the same pattern:

```
src/features/<feature>/
  api.ts                         # Supabase queries + Edge Function calls
  types.ts                       # Feature-specific TS types
  hooks.ts                       # React Query hooks
  components/
  screens/                       # Optional if you keep screens out of /app
  logic/                         # Domain logic (pure functions)
  index.ts                       # Barrel exports
```

---

# 21. Feature Development Toolkit (Developer Features)

These are “engineering features” that make the product easier to build, test, ship, and iterate.

## 21.1 Environments & configuration

- `.env` separation:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_API_BASE_URL` (if you expose Edge Functions behind a gateway)
  - `EXPO_PUBLIC_ENV=dev|staging|prod`
- EAS build profiles:
  - `development` (dev client)
  - `preview` (internal testers)
  - `production` (stores)

## 21.2 Feature flags & gradual rollout

Add a small table + client helper so you can release features safely.

### Option A (simple): per-plan gating

- Use `user_plans.plan` in the client to gate premium UI.

### Option B (recommended): remote feature flags

Create a table `feature_flags`:

- `key` (text, unique)
- `enabled` (bool)
- `rollout_percent` (int 0–100)
- `allowlist_user_ids` (uuid[])

Client logic:

- fetch flags at startup
- compute deterministic rollout bucket (hash(user\_id))

Use cases:

- Ship delivered-price alerts behind a flag
- A/B test “premium paywall copy”
- Roll out new ingestion sources gradually

## 21.3 Debug / QA mode (in-app)

Add a hidden “Developer Menu” (e.g. 7 taps on version number):

- Clear local lists
- Force refresh queries
- Toggle mock data mode
- View current feature flags
- View last ingestion timestamp

## 21.4 Mock mode & fixtures (fast UI work)

- `src/lib/mock/fixtures/` with:
  - sample sets
  - sample offers
  - sample price history
- Switcher:
  - use fixtures when `EXPO_PUBLIC_ENV=dev` and flag `mock_mode=true`

## 21.5 Analytics & event tracking

Track product learning without being creepy:

- `search_performed`
- `set_viewed`
- `affiliate_click`
- `watch_added`
- `alert_created`
- `alert_triggered`
- `paywall_viewed`
- `premium_started`

Tools (pick later): PostHog / Amplitude / Firebase Analytics.

## 21.6 Error monitoring

- Sentry (recommended) with source maps via EAS.
- Log ingestion errors in Supabase table `ingestion_runs`:
  - run\_id
  - source
  - started\_at / finished\_at
  - status
  - counts (offers processed, snapshots inserted)
  - error\_message

## 21.7 Testing strategy

- Unit tests: domain logic (matching, pricing) with Vitest/Jest
- Integration tests: Edge Functions locally (Deno) using sample feed fixtures
- E2E smoke: Detox (optional later)

## 21.8 CI/CD essentials

GitHub Actions:

- Lint + typecheck
- Run unit tests
- (Optional) Build preview with EAS on main branch
- Validate Supabase migrations (SQL lint + apply to test DB)

## 21.9 Admin tools (data quality)

Even a minimal admin saves weeks:

- Match Queue UI:
  - unresolved products
  - assign set\_id
  - store mapping overrides
- Retailer health dashboard:
  - last successful ingest
  - number of offers updated
  - error logs

---

# 22. Feature Backlog (Implementation-Friendly)

A structured feature backlog you can execute in order.

## 22.1 MVP (anonymous)

- Browse (best prices daily)
- Search (by set\_num + name)
- Set detail + offer list
- Local lists: watchlist, wishlist, owned
- Affiliate clickout tracking

## 22.2 Account & Sync

- Auth (magic link + email)
- Migrate local lists → server
- Push token registration

## 22.3 Alerts v1 (free)

- Alert type: below\_base\_price
- Cooldown
- Alert history

## 22.4 Data pipeline v1 (daily)

- bol connector
- 1 affiliate network connector
- Best prices recompute

## 22.5 Premium v1

- Paywall
- user\_plans entitlements
- Unlimited watchlist
- Extra alerts per set
- History 365 days

## 22.6 Premium v2 (high value)

- Delivered-price alerts
- Retailer filtering
- Lowest 90d / percent drop 30d
- Portfolio insights (owned sets)

---

# 23. Copy‑paste Starter Files (Expo + Supabase + React Query)

This section gives you the **baseline files** so an AI (or you) can scaffold the app consistently.

> Assumption: **Expo SDK 54**, **Expo Router**, TypeScript strict, React Query.

## 23.1 `.env.example`

Create `.env` locally (never commit). Expo uses `EXPO_PUBLIC_*` vars at build/runtime.

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"

# App
EXPO_PUBLIC_ENV="dev" # dev|staging|prod
EXPO_PUBLIC_DEFAULT_COUNTRY="BE" # BE|NL

# Optional: Edge Functions base URL override
# If not set, functions are called via supabase.functions.invoke
EXPO_PUBLIC_API_BASE_URL=""

# Optional: Analytics
EXPO_PUBLIC_POSTHOG_KEY=""
EXPO_PUBLIC_SENTRY_DSN=""
```

## 23.2 `eas.json`

Provides development/preview/production profiles.

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 23.3 `app.config.ts`

Centralizes config + uses env vars.

```ts
import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'PriBrix',
  slug: 'pribrix',
  scheme: 'pribrix',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  ios: {
    supportsTablet: false
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.pribrix'
  },
  plugins: ['expo-router'],
  extra: {
    env: process.env.EXPO_PUBLIC_ENV,
    defaultCountry: process.env.EXPO_PUBLIC_DEFAULT_COUNTRY,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL
  }
}

export default config
```

## 23.4 `src/lib/supabase/client.ts`

```ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY)')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
```

## 23.5 `src/lib/queryClient.ts`

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 60 * 24 // 24h
    }
  }
})
```

## 23.6 `src/lib/auth/session.tsx` (Session provider)

```tsx
import React from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase/client'

type SessionContextValue = {
  session: Session | null
  isLoading: boolean
}

const SessionContext = React.createContext<SessionContextValue>({
  session: null,
  isLoading: true
})

export function useSession() {
  return React.useContext(SessionContext)
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setIsLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}
```

## 23.7 `app/_layout.tsx` (App root providers)

```tsx
import React from 'react'
import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/src/lib/queryClient'
import { SessionProvider } from '@/src/lib/auth/session'

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </QueryClientProvider>
  )
}
```

## 23.8 `src/lib/storage/keys.ts`

```ts
export const storageKeys = {
  localWatchlist: 'local_watchlist',
  localWishlist: 'local_wishlist',
  localOwned: 'local_owned',
  settings: 'settings'
} as const
```

## 23.9 `src/lib/storage/localLists.ts`

Single place for local-first list types + helpers.

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { storageKeys } from './keys'

export type CountryScope = 'BE' | 'NL' | '*'

export type LocalWatchItem = {
  set_num: string
  country?: CountryScope
  target_base_price?: number
  target_delivered_price?: number
}

export type LocalWishlistItem = {
  set_num: string
  priority?: 'low' | 'medium' | 'high'
  target_base_price?: number
  target_delivered_price?: number
  notes?: string
}

export type LocalOwnedItem = {
  set_num: string
  quantity?: number
  condition?: 'sealed' | 'used' | 'incomplete'
  box_condition?: string
  purchase_price?: number
  purchase_date?: string
  notes?: string
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function getLocalWatchlist(): Promise<LocalWatchItem[]> {
  const raw = await AsyncStorage.getItem(storageKeys.localWatchlist)
  return safeParse(raw, [])
}

export async function setLocalWatchlist(items: LocalWatchItem[]) {
  await AsyncStorage.setItem(storageKeys.localWatchlist, JSON.stringify(items))
}

export async function getLocalWishlist(): Promise<LocalWishlistItem[]> {
  const raw = await AsyncStorage.getItem(storageKeys.localWishlist)
  return safeParse(raw, [])
}

export async function setLocalWishlist(items: LocalWishlistItem[]) {
  await AsyncStorage.setItem(storageKeys.localWishlist, JSON.stringify(items))
}

export async function getLocalOwned(): Promise<LocalOwnedItem[]> {
  const raw = await AsyncStorage.getItem(storageKeys.localOwned)
  return safeParse(raw, [])
}

export async function setLocalOwned(items: LocalOwnedItem[]) {
  await AsyncStorage.setItem(storageKeys.localOwned, JSON.stringify(items))
}
```

---

# 24. Reference API (Client Queries & Edge Functions)

This section is the **contract** the AI should follow when implementing screens.

## 24.1 Public read queries (no login)

### Browse (best prices)

- Table: `set_best_prices_daily` join `sets`
- Filters:
  - `country in ('BE','NL')`
  - optionally: `best_base_price is not null`
- Sort options:
  - lowest base price
  - lowest delivered price (where available)
  - biggest discount vs MSRP (if msrp known)

### Search

- Table: `sets`
- Search:
  - exact match on `set_num`
  - trigram match on `name` (via `ilike` or `textSearch`)

## 24.2 Auth queries (after login)

- CRUD tables:
  - `watchlists`, `alerts`
  - `user_wishlist_sets`, `user_owned_sets`
  - `push_tokens`
  - `alert_events` (read)

## 24.3 Recommended Edge Function: `get_set_detail`

Why: reduces client roundtrips and lets you hide heavy snapshot tables.

### Input

```json
{
  "set_num": "10307",
  "country": "BE",
  "include_history_days": 90
}
```

### Output (example)

```json
{
  "set": { "set_num": "10307", "name": "Eiffel Tower", "theme": "Icons", "year": 2022, "image_url": "..." },
  "best": {
    "base": { "price": 129.0, "offer_id": "...", "retailer": "bol.com" },
    "delivered": { "price": 134.0, "offer_id": "...", "retailer": "Coolblue" }
  },
  "offers": [
    { "offer_id": "...", "retailer": "bol.com", "price": 129.0, "shipping": 4.99, "delivered": 133.99, "stock": "in_stock", "product_url": "..." }
  ],
  "history": [
    { "date": "2026-03-01", "min_base": 129.0, "min_delivered": 133.99 }
  ]
}
```

Implementation notes:

- Use `set_offers_with_latest` view for current offers.
- For history, return aggregated daily minimums (do not send all snapshots).

---

# 24b. Implementation Decisions (Resolved)

This section documents specific implementation decisions that were ambiguous in earlier sections. Follow these exactly.

## 24b.1 Styling — NativeWind v4

All React Native components use **NativeWind v4** for styling.

- Use `className` props with Tailwind utility classes.
- Do **not** use `StyleSheet.create` except for rare cases NativeWind cannot handle (e.g. complex animated transforms).
- Design tokens (brand colors, spacing scale) are defined in `tailwind.config.js`.

Install:

```bash
npx expo install nativewind tailwindcss
```

## 24b.2 Price history charts — react-native-gifted-charts

Use **react-native-gifted-charts** for all price history charts.

- Chart component: `<LineChart />` from `react-native-gifted-charts`
- Always feed it aggregated daily-min data from `set_price_daily` (never raw snapshots)
- Wrap in a reusable component: `src/features/sets/components/PriceHistoryChart.tsx`

Install:

```bash
npx expo install react-native-gifted-charts react-native-linear-gradient
```

## 24b.3 Affiliate links — expo-web-browser

All outbound affiliate retailer links must use **expo-web-browser**.

```ts
import * as WebBrowser from 'expo-web-browser'

await WebBrowser.openBrowserAsync(affiliateUrl)
```

Do **not** use `Linking.openURL` for affiliate URLs. The in-app browser improves UX and affiliate attribution.

Fire an `affiliate_click` analytics event before opening the browser.

Install:

```bash
npx expo install expo-web-browser
```

## 24b.4 Zod validation schemas

Shared Zod schemas live in `src/lib/validation/`. Every Edge Function response must be parsed through the matching schema before use in the UI.

Minimum required schemas:

```
src/lib/validation/
  sets.ts        # SetSchema, SetListSchema
  offers.ts      # OfferSchema, OfferListSchema
  prices.ts      # BestPriceSchema, DailyHistorySchema
  alerts.ts      # AlertSchema, AlertEventSchema
  lists.ts       # WatchlistSchema, WishlistSchema, OwnedSchema
```

Example (`sets.ts`):

```ts
import { z } from 'zod'

export const SetSchema = z.object({
  id: z.string().uuid(),
  set_num: z.string(),
  name: z.string(),
  theme: z.string().nullable(),
  year: z.number().int().nullable(),
  image_url: z.string().url().nullable(),
  msrp_eur: z.number().nullable(),
})

export type Set = z.infer<typeof SetSchema>
```

## 24b.5 Mock fixtures

Mock fixtures live in `src/lib/mock/fixtures/` and are used when `EXPO_PUBLIC_ENV=dev` and `mock_mode` feature flag is `true`.

Required fixture files:

```
src/lib/mock/fixtures/
  sets.ts          # 10 sample sets
  offers.ts        # 3-5 offers per set
  priceHistory.ts  # 90 days of daily min prices per set
  watchlist.ts     # 3 sample watchlist entries
```

A `useMockMode()` hook returns `true` when mock mode is active. All `api.ts` files check this flag and return fixtures instead of hitting Supabase.

## 24b.6 Auth edge cases

The magic link auth flow must handle:

| Scenario | Behavior |
|---|---|
| Link expires (> 1 hour) | Show error screen: "This link has expired. Request a new one." + button to re-enter email |
| Link opened on different device | Supabase handles this — session is created on the device that clicks the link. No special handling needed in v1. |
| User closes verify screen before clicking link | On next app open, show a banner: "Check your email to finish signing in." |
| Email not received | Add "Resend email" button (enabled after 60s cooldown) |

Email/password login is **not** included in v1. Magic link only.

Deep linking for magic link must be configured in `app.config.ts`:

```ts
scheme: 'pribrix',
// Supabase redirect URL: pribrix://auth/verify
```

And in Supabase dashboard → Auth → URL Configuration:
- Site URL: `pribrix://`
- Redirect URLs: `pribrix://auth/verify`

---

# 25. AI Build Instructions (Use this as the "system prompt" for your coding AI)

Copy this section into your AI tool when generating code.

## 25.1 Project goals

- Expo app with anonymous-first usage.
- Supabase for auth + syncing lists + alerts.
- Daily price cache for fast browsing.
- Lists: Watchlist (deal tracking), Wishlist (want), Owned (collection).
- Monetization: affiliate links + premium tier.

## 25.2 Non-negotiable rules

- Mobile app never scrapes retailer sites.
- All prices come from authorized feeds/APIs processed server-side.
- Anonymous users store lists in AsyncStorage.
- After login, migrate local lists to Supabase tables.
- RLS: user data is only accessible to its owner.

## 25.3 Required screens

- Home/Browse
- Search
- Set Detail
- My LEGO (Owned/Wishlist/Watching)
- Alerts
- Settings
- Auth

## 25.4 Required modules

- `src/lib/supabase/client.ts`
- `src/lib/auth/session.tsx`
- `src/lib/queryClient.ts`
- `src/lib/storage/localLists.ts`
- `src/lib/validation/` (Zod schemas: sets, offers, prices, alerts, lists)
- `src/lib/mock/fixtures/` (mock data for dev mode)
- feature modules under `src/features/*`

## 25.5 Data contracts

- Use `set_best_prices_daily` for browse.
- Use `sets` for search.
- Use Edge Function `get_set_detail` for the set detail page.
- User tables:
  - `watchlists`, `alerts`, `alert_events`
  - `user_owned_sets`, `user_wishlist_sets`
  - `push_tokens`, `user_plans`

## 25.6 Acceptance criteria

- App runs with mock mode (fixtures) without a backend.
- When configured with Supabase env vars, it loads real data.
- Local lists work while logged out.
- After login, migration happens and local lists are cleared.
- RLS prevents access to other users’ lists.

---

# 26. Data Sources & API Choices (Set info + Prices)

This is the **practical** answer to: “Hoe halen we set-nummers, set info en prijzen op?”

## 26.1 LEGO set catalog (set\_num, naam, thema, jaar, afbeelding)

### Option A — Rebrickable (recommended as primary)

Use Rebrickable as your **canonical set catalog**.

- Pros:
  - Very complete official set catalog
  - Great for stable identifiers (`set_num`) and metadata
  - Also supports user collection features (not needed for us, but useful reference)
- How we use it:
  - Import all sets into `public.sets`
  - Keep it updated via periodic sync (weekly/monthly)

### Option B — Brickset API v3 (good secondary / fallback)

Use Brickset when you prefer their metadata/images, or as a fallback.

- Pros:
  - Strong set metadata + community-driven completeness
  - API v3 available
- How we use it:
  - Optional enrichment job (images, extended fields)

### Recommended approach

- **Primary**: Rebrickable → fills `sets`
- **Optional enrichment**: Brickset → improve images/extra fields

## 26.2 Retail prices (BE/NL) — do NOT scrape

Prices come from **authorized feeds/APIs** (affiliate networks + retailer feeds) and are ingested daily.

### Retailer feed — bol.com (recommended #1 for Benelux coverage)

- Use bol’s affiliate **Productfeed** (FTP download, daily refresh).
- Why:
  - Huge catalog coverage
  - Designed for price comparison use-cases

### Affiliate networks (coverage across many shops)

Use these to cover many webshops without building 50 custom integrations.

- **Awin product feeds**
- **Daisycon productfeeds**
- **TradeTracker product feed data**
- **Tradedoubler Products API** (REST, searchable)

## 26.3 Optional: Market price / aftermarket (premium insight)

If you want “value” insights beyond retail (e.g. BrickLink stats):

- BrickLink “Get Price Guide” returns marketplace price statistics.

Use this carefully:

- It’s not “retail best price”; it’s “market stats”
- VAT handling can differ per API response/settings

## 26.4 Matching strategy: retailer product → set\_id

Retail feeds will give you:

- Product title
- Sometimes EAN
- Sometimes internal IDs

Matching rules:

1. Extract `set_num` from title using regex `\b\d{4,6}\b`
2. Validate that `set_num` exists in `sets`
3. If EAN exists: store it on the offer (helps future matching)
4. If ambiguous (bundles, multipacks): send to `match_queue` for manual mapping

Over time you’ll build a reliable mapping table (EAN ↔ set\_num, retailer sku ↔ set\_id).

## 26.5 Recommended v1 connector list (daily refresh)

Start small, then expand:

1. bol.com productfeed (BE+NL)
2. One affiliate network (Awin OR Daisycon)

Then add: 3) TradeTracker 4) Tradedoubler

## 26.6 Sync cadence

- Set catalog sync: weekly/monthly (sets change slower)
- Price ingestion: daily (as chosen)

---

# 27. PRD Readiness Check (What’s Missing / Risk Areas)
The plan is **good enough to start building** the mobile app and core schema. A few items are still missing (or only mentioned) that will matter in production.

## 27.1 Must-add before production (high priority)
1) **Match Queue + Overrides (data quality)**
   - We referenced `match_queue` but did not define it in SQL.
   - You need a place to store unresolved feed items and a way to override mapping.

2) **Aggregated history table (for charts)**
   - Returning raw snapshots is too heavy.
   - Add a daily aggregation table like `set_price_daily` (min price per day per set/country).

3) **Ingestion run logging + alert run logging (ops)**
   - You need visibility into “did today’s ingest run succeed?”
   - Add `ingestion_runs` and `ingestion_run_items` (optional).

4) **Affiliate compliance / attribution**
   - Most programs require that links include affiliate parameters and sometimes a disclosure.
   - Add an “Affiliate Disclosure” section in Settings + per-click tracking.

5) **Shipping policy ambiguity**
   - Delivered price only when shipping known.
   - Define UX copy and ranking behavior when shipping is unknown.

6) **Legal pages**
   - Privacy Policy (GDPR), Terms of Use, Affiliate disclosure.

## 27.2 Nice-to-have (can be after v1)
- Feature flags table (`feature_flags`) if you want gradual rollout.
- Multi-language (NL/FR/EN) for BE market.
- Barcode scanning (owned/wishlist).

---

# 28. Additional DB Tables (Copy-paste SQL)
Add these tables to support matching, history, and operations.

```sql
-- ==============================
-- 28.1 Match Queue (unresolved feed items)
-- ==============================
create table if not exists public.match_queue (
  id uuid primary key default gen_random_uuid(),
  source text not null,                       -- bol, awin, etc.
  retailer_id uuid references public.retailers(id) on delete set null,
  source_product_id text not null,
  title_raw text,
  ean text,
  product_url text,
  suggested_set_num text,
  reason text not null,                       -- "no_set_num", "ambiguous", "bundle", "not_in_catalog"
  payload jsonb,                              -- raw fields from feed
  status text not null default 'open' check (status in ('open','resolved','ignored')),
  resolved_set_id uuid references public.sets(id) on delete set null,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_queue_unique unique (source, source_product_id)
);

create index if not exists match_queue_status_idx on public.match_queue(status);
create index if not exists match_queue_retailer_idx on public.match_queue(retailer_id);

-- updated_at trigger

drop trigger if exists trg_match_queue_updated_at on public.match_queue;
create trigger trg_match_queue_updated_at
before update on public.match_queue
for each row execute function public.set_updated_at();


-- ==============================
-- 28.2 Mapping Overrides (stable mapping retailer product -> set)
-- ==============================
create table if not exists public.offer_set_overrides (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references public.retailers(id) on delete cascade,
  source_product_id text not null,
  set_id uuid not null references public.sets(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offer_set_overrides_unique unique (retailer_id, source_product_id)
);

create index if not exists offer_set_overrides_set_idx on public.offer_set_overrides(set_id);

drop trigger if exists trg_offer_set_overrides_updated_at on public.offer_set_overrides;
create trigger trg_offer_set_overrides_updated_at
before update on public.offer_set_overrides
for each row execute function public.set_updated_at();


-- ==============================
-- 28.3 Aggregated Daily History (for charts + premium)
-- ==============================
create table if not exists public.set_price_daily (
  set_id uuid not null references public.sets(id) on delete cascade,
  country text not null check (country in ('BE','NL')),
  day date not null,
  min_base_price numeric(10,2),
  min_delivered_price numeric(10,2),
  offer_id uuid references public.offers(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (set_id, country, day)
);

create index if not exists set_price_daily_day_idx on public.set_price_daily(day desc);


-- ==============================
-- 28.4 Ingestion Runs (ops & debugging)
-- ==============================
create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,                         -- bol, awin, etc.
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','failed')),
  offers_upserted int not null default 0,
  snapshots_inserted int not null default 0,
  match_queue_added int not null default 0,
  error_message text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ingestion_runs_source_idx on public.ingestion_runs(source);
create index if not exists ingestion_runs_started_idx on public.ingestion_runs(started_at desc);


-- ==============================
-- 28.5 Feature Flags (optional, for gradual rollout)
-- ==============================
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout_percent int not null default 100 check (rollout_percent between 0 and 100),
  allowlist_user_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

```

## 28.6 RLS for new tables
These should be **service/admin only** for writes. Feature flags are readable by all clients (needed for startup fetch).

```sql
alter table public.match_queue enable row level security;
alter table public.offer_set_overrides enable row level security;
alter table public.set_price_daily enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.feature_flags enable row level security;

-- Public read: set_price_daily (for chart history on Set Detail)
create policy "public_read_set_price_daily" on public.set_price_daily
for select using (true);

-- Public read: feature_flags (mobile app fetches at startup for feature gating)
create policy "public_read_feature_flags" on public.feature_flags
for select using (true);

-- Everything else: no policies = no access for anon/auth users.
-- Server (service role) bypasses RLS and handles all writes.
```

---

# 29. Ingestion Logic Requirements (So the AI implements correctly)
These are the rules your ingest function must follow.

## 29.1 Input normalization
- Currency: EUR only (convert if needed)
- Price fields:
  - base price must be numeric >= 0
  - shipping nullable
- Stock:
  - normalize to in_stock/out_of_stock/unknown

## 29.2 LEGO filtering
- Accept product if:
  - brand == LEGO OR
  - title contains "LEGO" AND a valid set number is found

## 29.3 Mapping order
1) Check `offer_set_overrides` first (hard override)
2) Extract set_num from title
3) Validate set_num exists in `sets`
4) If fail/ambiguous -> insert into `match_queue`

## 29.4 Best price recompute
- Update `set_best_prices_daily` per country:
  - base: lowest `price` among in_stock
  - delivered: lowest `price + shipping` where shipping is known

## 29.5 Daily aggregation
- After writing snapshots, upsert into `set_price_daily`:
  - `day = captured_at::date`
  - min base/delivered per set/country

---

# 30. Compliance & Store Readiness Checklist

## 30.1 Affiliate compliance (must-have)
- Add Settings item: “Affiliate disclosure”
- On outbound click:
  - always use affiliate URL
  - track event `affiliate_click`

## 30.2 GDPR basics (must-have)
- Privacy Policy: what data you store (email, watchlists, push tokens)
- Data deletion: implement “Delete my account/data” flow

## 30.3 App Store / Play Store basics
- App metadata: description, keywords, screenshots
- Icons/splash
- Crash reporting (Sentry) recommended
- Ensure you don’t claim LEGO affiliation


---

# 31. App name — PriBrix (final) + checks

**Final decision:** **PriBrix**

**Constraints (kept for reference)**
- Avoid using **“LEGO”** in the app name (trademark / store compliance).
- Avoid confusing similarity with **Brickwatch**.
- Prefer a short, brandable name that can scale beyond BE/NL later.

## 31.1 What we should do now (to lock the name)
1) Check **domains**: `pribrix.app`, `pribrix.com`, `pribrix.be`, `pribrix.nl` (or alternatives like `getpribrix.*`).
2) Check **Apple App Store** + **Google Play** for exact “PriBrix”.
3) Check **trademarks**:
   - BOIP (Benelux)
   - EUIPO (EU)
4) Reserve **social handles**: @pribrix.

# 31.2 Naming & positioning assets (store-ready)
- App name: **PriBrix**
- Subtitle idea: “Prijsalerts voor LEGO® sets in BE & NL”
- Disclaimer (Settings + store listing): “PriBrix is not affiliated with or endorsed by the LEGO Group.”

# 31.3 Fallback names (only if checks fail)
- PriBriq
- PriqBriq
- PriqPulse
- PriqSentry

# 31.4 Notes on collision risk
- “BRIX” is a crowded root. PriBrix can still work, but do the trademark/app-store checks early.

---

# 31.5 Archive (previous brainstorm)

# 31.6 Short, Benelux-coded (brandable)
These are intentionally “coined” names that read as *Benelux + bricks/sets*.

- **BNLXBriqs** (pronounce: “benelux briks”)
- **BNLXBrix**
- **BNXBriqs** (shorter variant)
- **BNXBrix**
- **BNXStud** (if you want “studs” instead of “bricks”)

# 31.7 Brand-root variants (ultra-unique strings)
 (ultra-unique strings)
If you want something that’s almost guaranteed to be unused, prefix with a unique brand root.

- **NastBrixa**
- **NastBrixo**
- **NastBriqs**

## 31.3 Quick selection guide
- If you want the most “consumer-friendly” → **BNLXBriqs**
- If you want the shortest on-screen label → **BNXBrix**
- If you want the most unique trademarkable string → **NastBrixa**

$1

## 31.5 Quick verdict: “LEGO Radar”
- **Catchy, but too risky as the public-facing brand name.** “LEGO” is a protected trademark and using it in an app name can easily imply affiliation/sponsorship.
- Even with a disclaimer, this can still trigger takedowns or store-review issues.
- Also: “Brick Radar / Brickradar” already exists as a LEGO-focused brand/site name, so “LEGO Radar” is likely to be seen as confusingly similar.

**Recommendation:** keep “LEGO Radar” as an internal codename only, and pick a brand name that does **not** contain LEGO.

## 31.6 Radar-style name directions (safer)
Pick one direction, then run BOIP/EUIPO + App Store/Play checks:

### Direction A — “Radar” + studs/bricks (brandable)
- **StudRadar** (simple concept; check availability)
- **BriqRadar** (spelling makes it more brandable)
- **BrickPulse** / **StudPulse**

### Direction B — “Scout/Beacon” (same meaning as radar)
- **StudBeacon**
- **SetBeacon**
- **DealBeacon**

### Direction C — Benelux-coded (launch scope baked in)
- **BNXRadar** (BE+NL encoded)
- **BeNeRadar**

## 31.7 Practical naming rule (to avoid rework)
- **Brand name:** avoid LEGO and avoid anything that looks like “Brickwatch”.
- **Store subtitle/description:** you can say “Track LEGO set deals” + add a clear non-affiliation disclaimer.
- **Domains/handles:** secure early (`.be`, `.nl`, `.com`, `.app`) before you design the logo.

## 31.8 Candidate evaluation: BNXBrix / RABrixs / PriBrixs
You proposed:
- **BNXBrix**
- **RABrixs**
- **PriBrixs**

### Practical notes
- The root **“Brix/Bricks” is heavily used** across apps and trademarks (many unrelated products use BRIX).
- That doesn’t make your name impossible, but it increases collision risk in **App Store search** and **trademark similarity**.

### Scorecard (1–5)
- **BNXBrix**: Memorability 4, Pronounceability 4, Uniqueness 3, Brand feel 4, Collision risk 3
  - Best of your 3 because BNX anchors it to Benelux + short.
- **RABrixs**: Memorability 2, Pronounceability 2–3, Uniqueness 4, Brand feel 2, Collision risk 3
  - Reads “Ra-briks” but the trailing **xs** feels awkward.
- **PriBrixs**: Memorability 3, Pronounceability 3, Uniqueness 4, Brand feel 3, Collision risk 3
  - “Pri” could hint **price**, good idea, but **Brixs** still awkward visually.

### Recommended tweaks (catchier while staying unique)
- **BNXBriq** (drop the x-ending; “Briq” looks more brandable)
- **BNXBrix** (keep as-is if you love it)
- **PriBriq** (price + briq, cleaner)
- **PriqBriq** (super coinable, very unique)
- **Rabriq** (cleaner than RABrixs)

### Variants around “PriqBriq” (same vibe)
Keep the core idea (Price + Briq), but vary spelling/syllables for brand feel & availability:

**Closest variants (1-letter tweaks):**
- **PriqBriqx**
- **PryqBriq**
- **PriqBrik**
- **PriqBriqz**
- **PriqBriqs**

**Shorter / more punchy:**
- **Priq**
- **BriqPriq**
- **PriqDrop**
- **PriqPing**
- **PriqPulse**

**More “deal/alert” encoded:**
- **PriqAlert**
- **PriqSignal**
- **PriqBeacon**
- **PriqRadar**
- **PriqSentry**

**Benelux-coded versions:**
- **PriqBriqBNX**
- **BNXPriqBriq**
- **PriqBriqNLBE**

**A bit more premium/brandable:**
- **PriqBriqio**
- **PriqBriqly**
- **PriqBriqster**

### Candidate: “PriBrix” (your latest)
**Pros**
- Short, easy to say in NL/EN.
- Communicates “price + bricks” immediately.

**Risks / notes**
- The **BRIX** root is crowded across unrelated brands/apps, so collision risk is higher than with **Briq** spellings.
- “PriBrix” is close to the string **“Pribrix”** which appears as usernames/handles online (not necessarily a brand, but worth checking).

**Recommended variants (cleaner + more unique while staying catchy)**
- **PriBriq** (cleanest)
- **PriqBrix** (mix of both)
- **PryBrix** (distinct vowel)
- **PriBrixx** (edgier, but increases uniqueness)
- **PriBrixa** (brandable suffix)

Suggestion: pick 1 “core” (e.g., **PriqBriq** or **PriBriq**) and 1 “fallback” (e.g., **PriqPulse** or **PriqSentry**) before you check domains/trademarks.

### Naming rule of thumb
- Avoid ending in **“xs”** unless you really want an “edgy tech” look.
- Prefer **1–2 strong syllables** + one distinctive twist.

### Next step
Before you commit:
1) Check exact name in **Apple App Store** + **Google Play**.
2) Check **domains** (`.app`, `.com`, `.be`, `.nl`).
3) Check **trademarks** (BOIP + EUIPO).



---

End of plan

