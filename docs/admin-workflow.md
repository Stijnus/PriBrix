# PriBrix Admin Workflow

Phase 7 uses the **Supabase Studio + SQL helpers** approach instead of a separate Next.js admin app. This keeps the admin surface minimal and avoids exposing any admin UI in the mobile project.

## Access Model

- Use Supabase Studio / SQL Editor with project admin access.
- Admin helper views and functions are **not granted** to `anon` or `authenticated`.
- The intended operator path is Studio or service-role SQL only.

## Match Queue

Review unresolved items:

```sql
select *
from public.admin_match_queue_view
where status = 'open'
order by created_at desc
limit 100;
```

Filter by retailer:

```sql
select *
from public.admin_match_queue_view
where status = 'open'
  and retailer_id = '<retailer-uuid>'
order by created_at desc
limit 100;
```

Resolve an item and create/update an override:

```sql
select public.admin_resolve_match_queue(
  '<match-queue-id>',
  '<set-id>',
  null
);
```

Ignore an item:

```sql
select public.admin_ignore_match_queue(
  '<match-queue-id>',
  null
);
```

## Overrides

List overrides:

```sql
select *
from public.admin_offer_overrides_view
order by created_at desc
limit 100;
```

Delete an override:

```sql
select public.admin_delete_override('<override-id>');
```

## Ingestion Health

Latest run per source:

```sql
select *
from public.admin_ingestion_latest_view
order by source;
```

Recent run history:

```sql
select *
from public.admin_ingestion_history_view
order by started_at desc
limit 100;
```

Dashboard stats:

```sql
select *
from public.admin_dashboard_stats_view;
```

## Notes

- `match_queue` now stores `source` and `product_url` so unresolved items are easier to review.
- Creating an override through `admin_resolve_match_queue` means the next ingestion run will auto-map the same retailer product.
- If you later build a dedicated admin web UI, these views and functions are the correct backend primitives to reuse.
