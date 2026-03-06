create table if not exists public.match_queue (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references public.retailers(id) on delete cascade,
  source_product_id text not null,
  title_raw text not null,
  ean text,
  suggested_set_id uuid references public.sets(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'resolved', 'ignored')),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint match_queue_unique_retailer_source unique (retailer_id, source_product_id)
);

create index if not exists match_queue_status_idx on public.match_queue (status);
create index if not exists match_queue_retailer_idx on public.match_queue (retailer_id);

create table if not exists public.offer_set_overrides (
  id uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references public.retailers(id) on delete cascade,
  source_product_id text not null,
  set_id uuid not null references public.sets(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint offer_set_overrides_unique_retailer_source unique (retailer_id, source_product_id)
);

create table if not exists public.set_price_daily (
  set_id uuid not null references public.sets(id) on delete cascade,
  country text not null check (country in ('BE', 'NL')),
  date date not null,
  min_base_price numeric(10,2) check (min_base_price is null or min_base_price >= 0),
  min_delivered_price numeric(10,2) check (min_delivered_price is null or min_delivered_price >= 0),
  primary key (set_id, country, date)
);

create index if not exists set_price_daily_lookup_idx on public.set_price_daily (set_id, country, date desc);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running', 'success', 'error')),
  offers_processed integer not null default 0 check (offers_processed >= 0),
  snapshots_inserted integer not null default 0 check (snapshots_inserted >= 0),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout_percent integer not null default 0 check (rollout_percent between 0 and 100),
  allowlist_user_ids uuid[] not null default '{}'
);
