## Alerts Flow

PriBrix evaluates alerts immediately after each `ingest_daily_prices` run finishes refreshing `set_best_prices_daily`.

Current flow:

1. `ingest_daily_prices` updates offers, snapshots, and cached best-price tables.
2. The function calls the shared `runAlertsAfterIngest` helper.
3. The helper inserts `alert_events` for triggered watchlist alerts.
4. Expo push notifications are sent in batches and invalid tokens are removed from `push_tokens`.

The same shared logic is also exposed as the `run_alerts_after_ingest` Edge Function for manual or scheduled runs.
