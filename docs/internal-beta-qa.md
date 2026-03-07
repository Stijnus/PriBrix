# Internal Beta QA Checklist

Current target: **internal beta**, **phone-only**, **manual Premium entitlements**.

## Pre-flight

1. Run `npm run verify`.
2. Confirm preview build environment has:
   - working Supabase project URL / anon key
   - `delete_user_data` deployed
   - `MOCK_FEED=true` or live feed secrets configured
   - Sentry env vars configured if crash reporting is being tested
3. Install preview builds on:
   - one iPhone
   - one Android phone

## Core flows

### Anonymous

- Browse loads best-price cards
- Search returns results for a known set number and a partial name
- Set detail loads offers/history
- Add to watchlist, wishlist, and collection locally
- Restart app and confirm local lists persist

### Auth and sync

- Request a magic link
- Open the link on-device and confirm sign-in completes
- Confirm local lists migrate once
- Add/remove items from synced watchlist, wishlist, and collection
- Sign out and sign back in

### Alerts

- Create a base-price alert on a watched set
- Edit the threshold and toggle enabled/disabled
- Trigger `ingest_daily_prices` / `run_alerts_after_ingest`
- Confirm:
  - push token stored
  - alert event created
  - push delivered
  - tapping the push opens the correct set

### Premium / paywall

- Hit the watchlist cap as a free user
- Confirm paywall opens instead of creating the extra watch
- Confirm locked history periods route to paywall
- Confirm manual Premium entitlement changes app behavior after refresh

### Settings / release checks

- Country toggle works
- Delivered-price toggle works
- Privacy / Terms / Affiliate Disclosure screens open
- Send a Sentry test event from Settings if Sentry is configured
- Delete-account flow removes the user and clears app state

## Failure-path checks

- No-network state on browse/search/detail
- Invalid set URL
- Expired or missing session while deleting account
- Broken function response for set detail or alerts

## Issue triage

Record each issue in one of these buckets:

- `beta blocker` — prevents tester rollout or breaks a primary flow
- `polish` — shippable for beta but should be fixed next
- `public-launch only` — safe to defer until after beta
