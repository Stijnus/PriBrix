# Internal Beta Status

Snapshot date: `2026-03-07`

## Repo state

- Current migration sequence: `00001` through `00009`
- Internal-beta target: phone-only
- Premium state: manual entitlements / stubbed checkout
- Verification script available: `npm run verify`

## Live Supabase function checks

Verified against the deployed project endpoint:

- `get_set_detail` → `200`
- `ingest_daily_prices` → `200`
- `run_alerts_after_ingest` → `200`
- `delete_user_data` → `404` (`not deployed`)

Observed live responses:

- `get_set_detail` returns the expected set payload for `75192-1`
- `ingest_daily_prices` currently returns empty sources / zero touched sets, so live data is not flowing yet
- `run_alerts_after_ingest` returns zero evaluated/triggered alerts, consistent with empty live ingest output

## Current blockers

1. `delete_user_data` must be deployed so account deletion can be verified end-to-end.
2. Affiliate feed approvals and secrets are still needed for real retailer prices.
3. Sentry environment variables are missing, so crash reporting cannot be validated yet.
4. Preview device builds and physical-device QA are still pending.

## EAS build state

- EAS project linked: `@stijnus/pribrix`
- Android preview build queued successfully:
  - build ID: `a75b4dee-901e-4886-bf24-877e5520b5b7`
  - status at verification time: `IN_PROGRESS`
- iOS preview build still requires Apple Developer authentication or manual credentials for internal distribution

## Notes

- Supabase CLI is still unauthorized from this machine for management commands.
- EAS project `@stijnus/pribrix` now exists and is linked in `app.config.ts`.
