create or replace function public.user_has_premium_access(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_plans up
    where up.user_id = target_user_id
      and up.plan = 'premium'
      and (
        up.status in ('active', 'past_due')
        or (up.current_period_end is not null and up.current_period_end > now())
      )
  );
$$;

create or replace function public.enforce_watchlist_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  watch_count integer;
begin
  if public.user_has_premium_access(new.user_id) then
    return new;
  end if;

  if exists (
    select 1
    from public.watchlists
    where user_id = new.user_id
      and set_id = new.set_id
      and country = new.country
  ) then
    return new;
  end if;

  select count(*)
  into watch_count
  from public.watchlists
  where user_id = new.user_id;

  if watch_count >= 20 then
    raise exception 'Free plan watchlist limit reached. Upgrade to Premium for unlimited watchlist items.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_watchlists_plan_limit on public.watchlists;
create trigger trg_watchlists_plan_limit
before insert on public.watchlists
for each row
execute function public.enforce_watchlist_plan_limit();

create or replace function public.enforce_alert_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  existing_alert_count integer;
begin
  select w.user_id
  into target_user_id
  from public.watchlists w
  where w.id = new.watch_id;

  if target_user_id is null then
    raise exception 'Watchlist item not found for alert.';
  end if;

  if public.user_has_premium_access(target_user_id) then
    return new;
  end if;

  if new.type <> 'below_base_price' then
    raise exception 'Free plan supports below_base_price alerts only.';
  end if;

  if tg_op = 'INSERT' then
    if exists (
      select 1
      from public.alerts
      where watch_id = new.watch_id
        and type = new.type
    ) then
      return new;
    end if;

    select count(*)
    into existing_alert_count
    from public.alerts
    where watch_id = new.watch_id;

    if existing_alert_count >= 1 then
      raise exception 'Free plan supports one alert per watchlist item.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_alerts_plan_limit on public.alerts;
create trigger trg_alerts_plan_limit
before insert or update on public.alerts
for each row
execute function public.enforce_alert_plan_limit();
