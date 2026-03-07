# PriBrix — Pending TODOs

Items that are deferred but need to be tackled before production launch.

---

## Affiliate Feed Credentials (required for live price data)

**Context:** The ingestion pipeline (`ingest_daily_prices`) is fully built and deployed. It currently runs with `MOCK_FEED=true` for development. Real prices require approved affiliate accounts and their feed URLs configured as Supabase Edge Function secrets.

### Step 1 — Apply for publisher accounts (all free)

| Network | URL | Relevant BE/NL retailers | Status |
|---------|-----|--------------------------|--------|
| **TradeTracker** | tradetracker.com | bol.com BE, bol.com NL, Coolblue, ToyChamp | ⬜ Not started |
| **Daisycon** | daisycon.com | bol.com NL, Wehkamp | ⬜ Not started |
| **bol.com Partner** | partner.bol.com | bol.com direct | ⬜ Not started |
| **Awin** | awin.com (€5 deposit, refunded) | Fnac BE/NL, others | ⬜ Not started |

### Step 2 — Once approved, configure Supabase secrets

In **Supabase Dashboard → Settings → Edge Functions → Secrets**:

```
MOCK_FEED=false
INGESTION_SECRET=<random secret, also set in DB: ALTER DATABASE postgres SET app.ingestion_secret = '...'>
BOL_FEEDS_JSON=[{"source":"bol_be","url":"...","format":"csv","retailerId":"<uuid>","headers":{},"fieldMap":{...}}]
AWIN_FEEDS_JSON=[{"source":"awin","url":"...","format":"csv","headers":{},"fieldMap":{...},"merchantRetailerMap":{"<merchant_id>":"<retailer_uuid>"}}]
```

See `project/phases/phase-6-ingestion.md` section 7 for the full field map examples per network.

### Step 3 — Get retailer UUIDs from DB

```sql
SELECT id, name, country FROM retailers ORDER BY name;
```

---

## Ingestion Pipeline — Switch to Live Data (before production)

**Context:** The pipeline currently runs with `MOCK_FEED=true`. Before going to production, switch to real affiliate feeds so `set_best_prices_daily` is populated with actual retailer prices.

### Step 1 — Trigger mock ingestion now (dev/staging)

Set `MOCK_FEED=true` as a Supabase Edge Function secret and trigger once to populate `set_best_prices_daily` for testing:

```bash
curl -X POST https://zecyfmxxbuwyhjyehmdq.supabase.co/functions/v1/ingest_daily_prices \
  -H "Content-Type: application/json" \
  -d '{}'
```

This makes the home screen browse list functional without real affiliate feeds.

### Step 2 — Switch to real feeds (production)

See **Affiliate Feed Credentials** section below for the full flow.

---

## Push Notifications (Phase 8)

Price alert push notifications require an Expo push token. Deferred until Phase 8.

---

## Premium Tier (Phase 9)

RevenueCat integration for subscription management. Deferred until Phase 9.
