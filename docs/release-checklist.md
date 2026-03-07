# Release Checklist

Current milestone: **internal beta**, **phone-only**, **manual Premium entitlements**.

## Pre-release

1. Bump `version` and `runtimeVersion` in [`app.config.ts`](/Users/stijnus/Github/PriBrix/app.config.ts).
2. Confirm any new SQL migrations are applied manually in order from [`supabase/migrations`](/Users/stijnus/Github/PriBrix/supabase/migrations).
3. Deploy updated Edge Functions:
   - `get_set_detail`
   - `ingest_daily_prices`
   - `run_alerts_after_ingest`
   - `delete_user_data`
4. Verify Edge Function secrets:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `INGESTION_SECRET`
   - `MOCK_FEED` for staging tests if needed
5. Set app env vars before build:
   - `EXPO_PUBLIC_SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN`
   - `EXPO_PUBLIC_TERMS_URL`
   - `EXPO_PUBLIC_PRIVACY_URL`
   - `EXPO_PUBLIC_PREMIUM_CHECKOUT_URL` when billing is live

## Verification

1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run `npx expo export --platform web`.
4. Trigger a mock or live ingest and confirm `set_best_prices_daily` refreshes.
5. Verify `run_alerts_after_ingest` creates `alert_events` and push sends on a signed-in device.
6. Confirm Settings exposes:
   - Privacy Policy
   - Terms of Service
   - Affiliate Disclosure
   - Delete Account
7. Confirm account deletion removes the auth user and cascades synced data.
8. Confirm Sentry receives a test exception when `EXPO_PUBLIC_SENTRY_DSN` is set.
9. Confirm analytics events appear in console logs in development.

## Current known blockers

- `delete_user_data` is implemented in the repo but not deployed live yet.
- Sentry env vars are still missing.
- Android preview build is queued; iOS preview build still requires Apple Developer credentials.
- Real retailer data still depends on affiliate feed approvals and Edge Function secrets.

## QA matrix

- Anonymous flow: browse, search, set detail, add to local lists
- Auth flow: magic link sign-in, migration, sign-out, sign-in again
- Watchlist flow: create alerts, premium gating, paywall route
- Alerts flow: receive push notification, open app into set detail
- Settings flow: country toggle, delivered-price toggle, legal links, delete account
- Error states: offline mode, invalid set number, failed function response
- Accessibility: screen reader labels, dynamic type, color contrast on key screens
- Device coverage: iPhone small/large, Android small/large, optional tablet smoke test

## Build and submission

1. `eas build --profile preview --platform ios`
2. `eas build --profile preview --platform android`
3. Install both preview builds and complete smoke tests.
4. `eas build --profile production --platform ios`
5. `eas build --profile production --platform android`
6. Submit with:
   - `eas submit --platform ios`
   - `eas submit --platform android`
7. Use [`docs/store-metadata.md`](/Users/stijnus/Github/PriBrix/docs/store-metadata.md) for listing text and disclosures.

For the current beta stage, stop after preview-build validation. Production builds and store submission remain deferred.

## Post-release monitoring

- Check Sentry for new crashes and unhandled promise rejections
- Review ingestion runs and alert trigger volume
- Watch analytics logs/provider dashboards for search, set view, affiliate click, and paywall events
- Confirm crash-free sessions stay acceptable after release

## Rollback

1. Pause store rollout if crash volume spikes.
2. Disable unstable client features with server-side flags where available.
3. Revert or hotfix the affected Edge Function first if the issue is backend-only.
4. Ship a patched mobile build if the issue is client-side.
