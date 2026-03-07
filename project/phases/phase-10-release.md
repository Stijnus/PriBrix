# Phase 10 — Store Readiness (Legal, QA, Release)

**Goal:** Add legal/compliance screens, crash reporting, analytics, and prepare the app for App Store and Google Play submission.

**Prerequisites:** All previous phases (core features complete)

**Status: INTERNAL BETA IN REPO** ✓ Verified 2026-03-07. Legal screens, analytics hooks, Sentry wiring, release docs, and the account deletion function are implemented in the repo. Remaining blockers are operational: deploy `delete_user_data`, configure Sentry env, link EAS builds to devices, and complete physical-device QA.

---

## 1. Legal Screens

- [x] Create `app/settings/privacy-policy.tsx`:
  - Local content via `src/content/legal.ts`; covers data collected, affiliate sharing, GDPR
- [x] Create `app/settings/terms.tsx`:
  - Terms of Service with usage rules, subscription terms, limitation of liability
- [x] Create `app/settings/affiliate-disclosure.tsx`:
  - Affiliate disclosure per FTC / EU consumer rules
- [x] Update Settings screen:
  - Links to Privacy Policy, Terms, Affiliate Disclosure
  - App version number shown in "About" section

## 2. LEGO Trademark Disclaimer

- [x] Disclaimer in Settings About section: "PriBrix is not affiliated with or endorsed by the LEGO Group."
- [x] Disclaimer included in `docs/store-metadata.md` for store listings
- [ ] Verify app icon / splash screen contain no LEGO trademarks (requires design review)

## 3. Account Deletion Flow

- [x] Create `app/settings/delete-account.tsx`:
  - Warning screen with permanent-deletion notice
  - Calls `delete_user_data` edge function, then signs out and clears local storage
  - Required by Apple and Google store policies
- [x] Create `supabase/functions/delete_user_data/index.ts`:
  - Deletes watchlists, alerts, push_tokens, wishlist, owned, user_plans
  - Then calls `supabase.auth.admin.deleteUser()`

## 4. Crash Reporting (Sentry)

- [x] `@sentry/react-native` installed and configured in `src/lib/monitoring/sentry.ts`:
  - DSN from `EXPO_PUBLIC_SENTRY_DSN`
  - Release/dist set from `expoConfig.version` and `nativeBuildVersion`
  - `initSentry()` called in `app/_layout.tsx`
- [x] Sentry error boundary around app root
- [ ] Test: trigger test error and verify in Sentry dashboard (requires Sentry project + DSN secret)
- [ ] Configure Sentry alert rules and performance monitoring (operational, post-setup)

## 5. Analytics Events

- [x] Create `src/lib/analytics/tracker.ts`:
  - `track(event, properties)`, `identify(userId)`, `reset()`
  - Console logging in dev; provider-agnostic (PostHog / Firebase ready)
- [x] Implement key events in `src/lib/analytics/events.ts`:
  - `search_performed`, `set_viewed`, `affiliate_click`, `watch_added`
  - `alert_created`, `paywall_viewed`, `premium_started`, `list_migration_completed`
- [x] Events wired into search, set detail, watchlist, alerts, and paywall flows

## 6. EAS Build Configuration

- [x] `eas.json` profiles: `development`, `preview`, `production`
- [x] App icon and splash screen configured in `app.config.ts`
- [ ] Test preview build on device:
  - `eas build --profile preview --platform ios`
  - `eas build --profile preview --platform android`

## 7. Store Metadata

- [x] `docs/store-metadata.md` created:
  - App Store: name, subtitle, description, keywords, category, content rating, non-affiliation disclaimer
  - Google Play: title, descriptions, data safety section
  - Privacy policy URL placeholder

## 8. QA Checklist

- [x] `docs/internal-beta-qa.md` created with full end-to-end flow checklist
- [ ] Physical device QA — test all user flows (requires live device + deployed build):
  - [ ] Anonymous: browse, search, view detail, add to local lists
  - [ ] Sign up with magic link
  - [ ] Local lists migrate to server on login
  - [ ] Create alert on watched set
  - [ ] Receive push notification (trigger via `ingest_daily_prices`)
  - [ ] Affiliate link opens in-app browser
  - [ ] Delete account
  - [ ] Settings: country toggle, delivered price toggle
- [ ] Error state testing (no network, server error, invalid set)
- [ ] Multi-device testing (iPhone SE, iPhone 15, Android)
- [ ] Accessibility (VoiceOver, dynamic type, color contrast)

## 9. Release Checklist Document

- [x] `docs/release-checklist.md` created:
  - Pre-release steps, build commands, store submission process
  - Post-release monitoring (Sentry, analytics, crash-free rate)
  - Rollback procedure

---

## Verification

- [x] Legal screens accessible from Settings
- [x] LEGO disclaimer visible in About/Settings
- [x] Account deletion flow implemented (edge function + client)
- [x] Sentry wired — awaiting DSN secret to test live crash reporting
- [x] Analytics events implemented and wired (console logs in dev)
- [x] Store metadata document complete
- [x] Release checklist document exists
- [ ] Preview build installs and runs on device (requires EAS build)
- [ ] All physical-device QA checklist items pass
- [ ] Sentry receives test crash report (requires EXPO_PUBLIC_SENTRY_DSN)
