create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  country text not null default '*' check (country in ('BE', 'NL', '*')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watchlists_unique_user_set_country unique (user_id, set_id, country)
);

create index if not exists watchlists_user_idx on public.watchlists (user_id);
create index if not exists watchlists_set_idx on public.watchlists (set_id);

drop trigger if exists trg_watchlists_updated_at on public.watchlists;
create trigger trg_watchlists_updated_at
before update on public.watchlists
for each row
execute function public.set_updated_at();

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watchlists(id) on delete cascade,
  type text not null check (type in ('below_base_price', 'below_delivered_price', 'percent_drop_30d', 'lowest_90d')),
  threshold_price numeric(10,2) check (threshold_price is null or threshold_price >= 0),
  threshold_percent numeric(5,2) check (threshold_percent is null or threshold_percent >= 0),
  cooldown_hours integer not null default 24 check (cooldown_hours between 1 and 720),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alerts_unique_watch_type unique (watch_id, type)
);

create index if not exists alerts_watch_idx on public.alerts (watch_id);
create index if not exists alerts_enabled_idx on public.alerts (is_enabled);

drop trigger if exists trg_alerts_updated_at on public.alerts;
create trigger trg_alerts_updated_at
before update on public.alerts
for each row
execute function public.set_updated_at();

create table if not exists public.alert_events (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  trigger_price numeric(10,2) not null check (trigger_price >= 0),
  triggered_at timestamptz not null default now(),
  sent_push boolean not null default false,
  sent_email boolean not null default false
);

create index if not exists alert_events_alert_idx on public.alert_events (alert_id);
create index if not exists alert_events_triggered_idx on public.alert_events (triggered_at desc);

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_idx on public.push_tokens (user_id);

drop trigger if exists trg_push_tokens_updated_at on public.push_tokens;
create trigger trg_push_tokens_updated_at
before update on public.push_tokens
for each row
execute function public.set_updated_at();

create table if not exists public.user_owned_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 1),
  condition text not null default 'sealed' check (condition in ('sealed', 'used', 'incomplete')),
  box_condition text,
  purchase_price numeric(10,2) check (purchase_price is null or purchase_price >= 0),
  purchase_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_owned_sets_unique_user_set unique (user_id, set_id)
);

create index if not exists user_owned_sets_user_idx on public.user_owned_sets (user_id);
create index if not exists user_owned_sets_set_idx on public.user_owned_sets (set_id);

drop trigger if exists trg_user_owned_sets_updated_at on public.user_owned_sets;
create trigger trg_user_owned_sets_updated_at
before update on public.user_owned_sets
for each row
execute function public.set_updated_at();

create table if not exists public.user_wishlist_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.sets(id) on delete cascade,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  target_base_price numeric(10,2) check (target_base_price is null or target_base_price >= 0),
  target_delivered_price numeric(10,2) check (target_delivered_price is null or target_delivered_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_wishlist_sets_unique_user_set unique (user_id, set_id)
);

create index if not exists user_wishlist_sets_user_idx on public.user_wishlist_sets (user_id);
create index if not exists user_wishlist_sets_set_idx on public.user_wishlist_sets (set_id);

drop trigger if exists trg_user_wishlist_sets_updated_at on public.user_wishlist_sets;
create trigger trg_user_wishlist_sets_updated_at
before update on public.user_wishlist_sets
for each row
execute function public.set_updated_at();

create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  provider text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_plans_updated_at on public.user_plans;
create trigger trg_user_plans_updated_at
before update on public.user_plans
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user_create_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_plans (user_id, plan, status, provider)
  values (new.id, 'free', 'active', 'system')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_create_plan on auth.users;
create trigger on_auth_user_create_plan
after insert on auth.users
for each row
execute function public.handle_new_user_create_plan();
