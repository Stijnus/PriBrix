# Phase 10 — Store Readiness (Legal, QA, Release)

**Goal:** Add legal/compliance screens, crash reporting, analytics, and prepare the app for App Store and Google Play submission.

**Prerequisites:** All previous phases (core features complete)

---

## 1. Legal Screens

- [ ] Create `app/settings/privacy-policy.tsx`:
  - Display privacy policy content (can be WebView loading a hosted page, or local markdown)
  - Cover: data collected, how it's used, third-party sharing (affiliate networks), user rights
  - Include GDPR compliance (BE/NL are EU)
- [ ] Create `app/settings/terms.tsx`:
  - Terms of Service / Terms of Use
  - Cover: app usage rules, subscription terms, limitation of liability
- [ ] Create `app/settings/affiliate-disclosure.tsx`:
  - Affiliate link disclosure: "PriBrix earns a commission when you buy through our links"
  - Required for affiliate program compliance (FTC, EU consumer rules)
- [ ] Update Settings screen:
  - Add links to Privacy Policy, Terms, Affiliate Disclosure
  - Show app version number
  - Add "About" section

## 2. LEGO Trademark Disclaimer

- [ ] Add disclaimer to app About/Settings:
  - "PriBrix is not affiliated with or endorsed by the LEGO Group."
- [ ] Ensure store listing includes this disclaimer
- [ ] Verify no LEGO trademarks used improperly in app icon, splash screen, or marketing

## 3. Account Deletion Flow

- [ ] Create `app/settings/delete-account.tsx`:
  - Warning: "This will permanently delete your account and all data"
  - Confirm with email/password or re-auth
  - Steps:
    1. Delete user data (watchlists, alerts, owned, wishlist, push_tokens)
    2. Delete Supabase auth user
    3. Clear local storage
    4. Navigate to Home screen
  - Required by Apple App Store and Google Play policies
- [ ] Create server-side helper (optional):
  - Edge Function `delete_user_data` that cascades all user data
  - Or rely on FK CASCADE rules from schema

## 4. Crash Reporting (Sentry)

- [ ] Install `@sentry/react-native` + `sentry-expo`
- [ ] Configure Sentry in `app/_layout.tsx`:
  - DSN from `EXPO_PUBLIC_SENTRY_DSN`
  - Enable source maps via EAS
  - Set release/dist for tracking
- [ ] Add Sentry error boundary around app root
- [ ] Test: trigger a test error and verify it appears in Sentry dashboard
- [ ] Configure Sentry project:
  - Alert rules for new issues
  - Performance monitoring (optional)

## 5. Analytics Events

- [ ] Create `src/lib/analytics/tracker.ts`:
  - Abstraction layer over analytics provider
  - Methods: `track(event, properties)`, `identify(userId)`, `reset()`
  - Initially: log to console in dev
  - Later: wire to PostHog / Amplitude / Firebase Analytics
- [ ] Implement key events:
  - `search_performed` — query, results count
  - `set_viewed` — set_num
  - `affiliate_click` — set_num, retailer, price
  - `watch_added` — set_num
  - `alert_created` — set_num, type, threshold
  - `alert_triggered` — set_num, trigger_price (server-side)
  - `paywall_viewed` — trigger reason
  - `premium_started` — plan type
  - `list_migration_completed` — counts
- [ ] Wire events into existing flows (search, set detail, watchlist, alerts, paywall)

## 6. EAS Build Configuration

- [ ] Verify `eas.json` build profiles:
  - `development`: dev client for testing
  - `preview`: internal distribution (TestFlight / internal track)
  - `production`: store submission builds
- [ ] Configure app icons:
  - iOS: 1024x1024 app icon
  - Android: adaptive icon (foreground + background)
- [ ] Configure splash screen:
  - Brand-consistent design
  - Light + dark mode variants
- [ ] Test preview build:
  - `eas build --profile preview --platform ios`
  - `eas build --profile preview --platform android`

## 7. Store Metadata

- [ ] Prepare App Store listing:
  - App name: "PriBrix"
  - Subtitle: "LEGO Price Tracker BE & NL"
  - Description (short + long)
  - Keywords
  - Screenshots (iPhone + iPad if applicable)
  - Privacy policy URL
  - Category: Shopping
  - Content rating
  - Non-affiliation disclaimer in description
- [ ] Prepare Google Play listing:
  - Title, short description, full description
  - Feature graphic
  - Screenshots (phone + tablet)
  - Privacy policy URL
  - Content rating questionnaire
  - Data safety section

## 8. QA Checklist

- [ ] Test all user flows end-to-end:
  - [ ] Anonymous: browse, search, view detail, add to local lists
  - [ ] Sign up with magic link
  - [ ] Local lists migrate to server
  - [ ] Add/remove from server lists
  - [ ] Create alert on watched set
  - [ ] Receive push notification (test with manual ingestion)
  - [ ] View alert history
  - [ ] Settings: country toggle, delivered price toggle
  - [ ] Affiliate link opens in-app browser
  - [ ] Delete account
  - [ ] Sign out and back in
- [ ] Test error states:
  - [ ] No network connection
  - [ ] Server error responses
  - [ ] Invalid set number in URL
- [ ] Test on multiple devices:
  - [ ] iOS (iPhone SE, iPhone 15, iPad)
  - [ ] Android (small screen, large screen)
- [ ] Test accessibility:
  - [ ] Screen reader support (VoiceOver / TalkBack)
  - [ ] Dynamic type / font scaling
  - [ ] Color contrast

## 9. Release Checklist Document

- [ ] Create `docs/release-checklist.md`:
  - Pre-release steps (version bump, changelog)
  - Build commands
  - Store submission process
  - Post-release monitoring (Sentry, analytics, crash-free rate)
  - Rollback procedure

---

## Verification

- [ ] Legal screens accessible from Settings
- [ ] LEGO disclaimer visible in About/Settings
- [ ] Account deletion works end-to-end
- [ ] Sentry receives test crash report
- [ ] Analytics events fire correctly (check console logs)
- [ ] Preview build installs and runs on device
- [ ] All QA checklist items pass
- [ ] Store metadata document is complete
- [ ] Release checklist document exists
