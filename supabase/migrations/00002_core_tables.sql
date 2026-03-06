create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  set_num text not null unique,
  name text not null,
  theme text not null,
  year integer not null check (year between 1949 and 2100),
  image_url text,
  msrp_eur numeric(10,2) check (msrp_eur is null or msrp_eur >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sets_name_trgm_idx on public.sets using gin (name gin_trgm_ops);
create index if not exists sets_theme_idx on public.sets (theme);
create index if not exists sets_year_idx on public.sets (year);

drop trigger if exists trg_sets_updated_at on public.sets;
create trigger trg_sets_updated_at
before update on public.sets
for each row
execute function public.set_updated_at();

create table if not exists public.retailers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null check (country in ('BE', 'NL')),
  affiliate_network text,
  base_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists retailers_country_idx on public.retailers (country);
create index if not exists retailers_active_idx on public.retailers (is_active);

drop trigger if exists trg_retailers_updated_at on public.retailers;
create trigger trg_retailers_updated_at
before update on public.retailers
for each row
execute function public.set_updated_at();

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references public.retailers(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  source_product_id text not null,
  ean text,
  product_url text not null,
  title_raw text not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offers_unique_retailer_source unique (retailer_id, source_product_id)
);

create index if not exists offers_set_idx on public.offers (set_id);
create index if not exists offers_retailer_idx on public.offers (retailer_id);
create index if not exists offers_ean_idx on public.offers (ean);
create index if not exists offers_last_seen_idx on public.offers (last_seen_at desc);
create index if not exists offers_title_trgm_idx on public.offers using gin (title_raw gin_trgm_ops);

drop trigger if exists trg_offers_updated_at on public.offers;
create trigger trg_offers_updated_at
before update on public.offers
for each row
execute function public.set_updated_at();

create table if not exists public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  price numeric(10,2) not null check (price >= 0),
  shipping numeric(10,2) check (shipping is null or shipping >= 0),
  stock_status text not null check (stock_status in ('in_stock', 'out_of_stock', 'unknown')),
  captured_at timestamptz not null default now()
);

create index if not exists price_snapshots_offer_captured_idx on public.price_snapshots (offer_id, captured_at desc);
create index if not exists price_snapshots_captured_idx on public.price_snapshots (captured_at desc);

create table if not exists public.set_best_prices_daily (
  set_id uuid not null references public.sets(id) on delete cascade,
  country text not null check (country in ('BE', 'NL')),
  best_base_price numeric(10,2) check (best_base_price is null or best_base_price >= 0),
  best_base_offer_id uuid references public.offers(id) on delete set null,
  best_delivered_price numeric(10,2) check (best_delivered_price is null or best_delivered_price >= 0),
  best_delivered_offer_id uuid references public.offers(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (set_id, country)
);

create index if not exists set_best_prices_daily_country_idx on public.set_best_prices_daily (country);
create index if not exists set_best_prices_daily_updated_idx on public.set_best_prices_daily (updated_at desc);
