# PriBrix — Pending TODOs

Items that remain after the internal-beta feature build. This file now tracks beta blockers and production-launch work, not old phase placeholders.

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

## Internal Beta Operations

### Live function parity

- `get_set_detail` — live
- `ingest_daily_prices` — live
- `run_alerts_after_ingest` — live
- `delete_user_data` — **not deployed yet** (endpoint returns 404 as of 2026-03-07)

### Monitoring / build setup

- Configure Sentry env vars:
  - `EXPO_PUBLIC_SENTRY_DSN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
  - `SENTRY_AUTH_TOKEN`
- Confirm the new EAS project link is working and run preview builds for iOS + Android
- Android preview build has been queued once successfully; keep tracking its result in EAS
- iOS preview build still needs Apple Developer credentials or a `credentials.json` flow
- Send a real Sentry test event from a preview build and confirm ingestion in Sentry

### Device QA

- Run the signed-in physical-device checklist from `docs/internal-beta-qa.md`
- Verify push permission prompt, token registration, alert delivery, cooldown, and notification deep link handling
- Verify delete-account flow end-to-end after `delete_user_data` is deployed

---

## Premium Billing (deferred until soft/public launch)

- Keep Premium in manual-entitlement mode for internal beta
- Decide on billing provider later:
  - app-store billing only
  - Stripe web checkout for early web-based billing
  - RevenueCat if subscription management complexity increases

---

## Public Launch Backlog

- Finalize live retailer feeds and match-queue cleanup
- Produce store screenshots and feature graphic
- Complete App Store / Google Play metadata and compliance forms
- Decide whether hosted legal URLs are needed beyond the in-app screens
- Revisit tablet support only after phone-only beta is stable
