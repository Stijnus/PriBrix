create or replace view public.offer_latest_snapshot as
select distinct on (ps.offer_id)
  ps.offer_id,
  ps.price,
  ps.shipping,
  ps.stock_status,
  ps.captured_at,
  (ps.price + coalesce(ps.shipping, 0))::numeric(10,2) as delivered_price_calc
from public.price_snapshots ps
order by ps.offer_id, ps.captured_at desc;

create or replace view public.set_offers_with_latest as
select
  o.id as offer_id,
  o.set_id,
  o.retailer_id,
  r.name as retailer_name,
  r.country,
  o.product_url,
  o.title_raw,
  o.ean,
  o.last_seen_at,
  ols.price,
  ols.shipping,
  ols.delivered_price_calc as delivered_price,
  ols.stock_status,
  ols.captured_at
from public.offers o
join public.retailers r on r.id = o.retailer_id
left join public.offer_latest_snapshot ols on ols.offer_id = o.id
where r.is_active = true;
