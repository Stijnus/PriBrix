alter table public.match_queue
add column if not exists source text,
add column if not exists product_url text;

create or replace view public.admin_match_queue_view as
select
  mq.id,
  mq.source,
  mq.source_product_id,
  mq.title_raw,
  mq.product_url,
  mq.ean,
  mq.status,
  mq.created_at,
  mq.resolved_at,
  mq.retailer_id,
  r.name as retailer_name,
  r.country as retailer_country,
  mq.suggested_set_id,
  suggested.set_num as suggested_set_num,
  suggested.name as suggested_set_name,
  mq.resolved_by
from public.match_queue mq
join public.retailers r on r.id = mq.retailer_id
left join public.sets suggested on suggested.id = mq.suggested_set_id;

create or replace view public.admin_offer_overrides_view as
select
  o.id,
  o.retailer_id,
  r.name as retailer_name,
  r.country as retailer_country,
  o.source_product_id,
  o.set_id,
  s.set_num,
  s.name as set_name,
  o.created_by,
  o.created_at
from public.offer_set_overrides o
join public.retailers r on r.id = o.retailer_id
join public.sets s on s.id = o.set_id;

create or replace view public.admin_ingestion_history_view as
select
  ir.id,
  ir.source,
  ir.started_at,
  ir.finished_at,
  ir.status,
  ir.offers_processed,
  ir.snapshots_inserted,
  ir.error_message,
  case
    when ir.finished_at is null then null
    else extract(epoch from (ir.finished_at - ir.started_at))::integer
  end as duration_seconds
from public.ingestion_runs ir
order by ir.started_at desc;

create or replace view public.admin_ingestion_latest_view as
with ranked_runs as (
  select
    ir.*,
    row_number() over (partition by ir.source order by ir.started_at desc) as row_num
  from public.ingestion_runs ir
)
select
  rr.id,
  rr.source,
  rr.started_at,
  rr.finished_at,
  rr.status,
  rr.offers_processed,
  rr.snapshots_inserted,
  rr.error_message,
  case
    when rr.finished_at is null then null
    else extract(epoch from (rr.finished_at - rr.started_at))::integer
  end as duration_seconds,
  case
    when rr.status = 'success' and rr.started_at >= now() - interval '24 hours' then 'green'
    when rr.started_at >= now() - interval '48 hours' then 'yellow'
    else 'red'
  end as health_color
from ranked_runs rr
where rr.row_num = 1;

create or replace view public.admin_dashboard_stats_view as
select
  (select count(*)::bigint from public.sets) as total_sets,
  (
    select count(*)::bigint
    from public.set_offers_with_latest sol
    where (sol.stock_status is distinct from 'out_of_stock')
      and (sol.last_seen_at is null or sol.last_seen_at >= now() - interval '7 days')
  ) as total_active_offers,
  (
    select count(*)::bigint
    from public.match_queue
    where status = 'open'
  ) as open_match_queue_items,
  (
    select max(updated_at)
    from public.set_best_prices_daily
  ) as last_best_prices_refresh_at;

create or replace function public.admin_resolve_match_queue(
  queue_id uuid,
  resolved_set_id uuid,
  resolved_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  queue_row public.match_queue%rowtype;
begin
  select *
  into queue_row
  from public.match_queue
  where id = queue_id;

  if not found then
    raise exception 'match_queue item % not found', queue_id;
  end if;

  insert into public.offer_set_overrides (
    retailer_id,
    source_product_id,
    set_id,
    created_by
  )
  values (
    queue_row.retailer_id,
    queue_row.source_product_id,
    resolved_set_id,
    resolved_user_id
  )
  on conflict (retailer_id, source_product_id) do update
  set
    set_id = excluded.set_id,
    created_by = coalesce(excluded.created_by, public.offer_set_overrides.created_by);

  update public.match_queue
  set
    status = 'resolved',
    suggested_set_id = resolved_set_id,
    resolved_by = resolved_user_id,
    resolved_at = now()
  where id = queue_id;
end;
$$;

create or replace function public.admin_ignore_match_queue(
  queue_id uuid,
  resolved_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.match_queue
  set
    status = 'ignored',
    resolved_by = resolved_user_id,
    resolved_at = now()
  where id = queue_id;

  if not found then
    raise exception 'match_queue item % not found', queue_id;
  end if;
end;
$$;

create or replace function public.admin_delete_override(override_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.offer_set_overrides
  where id = override_id;

  if not found then
    raise exception 'override % not found', override_id;
  end if;
end;
$$;

revoke all on public.admin_match_queue_view from anon, authenticated;
revoke all on public.admin_offer_overrides_view from anon, authenticated;
revoke all on public.admin_ingestion_history_view from anon, authenticated;
revoke all on public.admin_ingestion_latest_view from anon, authenticated;
revoke all on public.admin_dashboard_stats_view from anon, authenticated;

revoke all on function public.admin_resolve_match_queue(uuid, uuid, uuid) from anon, authenticated;
revoke all on function public.admin_ignore_match_queue(uuid, uuid) from anon, authenticated;
revoke all on function public.admin_delete_override(uuid) from anon, authenticated;
