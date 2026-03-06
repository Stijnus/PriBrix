grant usage on schema public to anon, authenticated;

grant select on public.sets to anon, authenticated;
grant select on public.retailers to anon, authenticated;
grant select on public.offers to anon, authenticated;
grant select on public.price_snapshots to anon, authenticated;
grant select on public.set_best_prices_daily to anon, authenticated;
grant select on public.offer_latest_snapshot to anon, authenticated;
grant select on public.set_offers_with_latest to anon, authenticated;

grant select, insert, update, delete on public.watchlists to authenticated;
grant select, insert, update, delete on public.alerts to authenticated;
grant select on public.alert_events to authenticated;
grant select, insert, update, delete on public.push_tokens to authenticated;
grant select, insert, update, delete on public.user_owned_sets to authenticated;
grant select, insert, update, delete on public.user_wishlist_sets to authenticated;
grant select on public.user_plans to authenticated;

revoke all on public.match_queue from anon, authenticated;
revoke all on public.offer_set_overrides from anon, authenticated;
revoke all on public.set_price_daily from anon, authenticated;
revoke all on public.ingestion_runs from anon, authenticated;
revoke all on public.feature_flags from anon, authenticated;

alter table public.sets enable row level security;
alter table public.retailers enable row level security;
alter table public.offers enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.set_best_prices_daily enable row level security;

alter table public.watchlists enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_events enable row level security;
alter table public.push_tokens enable row level security;
alter table public.user_owned_sets enable row level security;
alter table public.user_wishlist_sets enable row level security;
alter table public.user_plans enable row level security;

alter table public.match_queue enable row level security;
alter table public.offer_set_overrides enable row level security;
alter table public.set_price_daily enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.feature_flags enable row level security;

create policy "public_read_sets"
on public.sets
for select
using (true);

create policy "public_read_retailers"
on public.retailers
for select
using (true);

create policy "public_read_offers"
on public.offers
for select
using (true);

create policy "public_read_price_snapshots"
on public.price_snapshots
for select
using (true);

create policy "public_read_best_prices"
on public.set_best_prices_daily
for select
using (true);

create policy "watchlists_select_own"
on public.watchlists
for select
using (auth.uid() = user_id);

create policy "watchlists_insert_own"
on public.watchlists
for insert
with check (auth.uid() = user_id);

create policy "watchlists_update_own"
on public.watchlists
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "watchlists_delete_own"
on public.watchlists
for delete
using (auth.uid() = user_id);

create policy "alerts_select_own"
on public.alerts
for select
using (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

create policy "alerts_insert_own"
on public.alerts
for insert
with check (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

create policy "alerts_update_own"
on public.alerts
for update
using (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

create policy "alerts_delete_own"
on public.alerts
for delete
using (
  exists (
    select 1
    from public.watchlists w
    where w.id = alerts.watch_id
      and w.user_id = auth.uid()
  )
);

create policy "alert_events_select_own"
on public.alert_events
for select
using (
  exists (
    select 1
    from public.alerts a
    join public.watchlists w on w.id = a.watch_id
    where a.id = alert_events.alert_id
      and w.user_id = auth.uid()
  )
);

create policy "push_tokens_select_own"
on public.push_tokens
for select
using (auth.uid() = user_id);

create policy "push_tokens_insert_own"
on public.push_tokens
for insert
with check (auth.uid() = user_id);

create policy "push_tokens_update_own"
on public.push_tokens
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "push_tokens_delete_own"
on public.push_tokens
for delete
using (auth.uid() = user_id);

create policy "owned_select_own"
on public.user_owned_sets
for select
using (auth.uid() = user_id);

create policy "owned_insert_own"
on public.user_owned_sets
for insert
with check (auth.uid() = user_id);

create policy "owned_update_own"
on public.user_owned_sets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "owned_delete_own"
on public.user_owned_sets
for delete
using (auth.uid() = user_id);

create policy "wishlist_select_own"
on public.user_wishlist_sets
for select
using (auth.uid() = user_id);

create policy "wishlist_insert_own"
on public.user_wishlist_sets
for insert
with check (auth.uid() = user_id);

create policy "wishlist_update_own"
on public.user_wishlist_sets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "wishlist_delete_own"
on public.user_wishlist_sets
for delete
using (auth.uid() = user_id);

create policy "plans_select_own"
on public.user_plans
for select
using (auth.uid() = user_id);
