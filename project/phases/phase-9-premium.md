# Phase 9 — Premium v1 (Entitlements + Paywall)

**Goal:** Implement free-tier limits and a premium subscription that unlocks unlimited watchlist, longer price history, and additional alert types.

**Prerequisites:** Phase 5 (auth), Phase 8 (alerts working)

**Status: IMPLEMENTED (MANUAL BETA)** ✓ Verified 2026-03-07. Entitlements, paywall gating, and server-side premium limits are in the repo. Migration `00009_premium_limits.sql` is the current premium schema change. Billing remains intentionally stubbed/manual for internal beta.

---

## 1. Entitlement Definition

- [x] Define free vs premium limits:

  | Feature | Free | Premium |
  |---------|------|---------|
  | Watchlist items | 20 | Unlimited |
  | Alerts per set | 1 | Multiple |
  | Alert types | below_base_price only | All types |
  | Price history | 30 days | 365 days |
  | Delivered-price alerts | No | Yes |

- [x] Create `src/features/premium/constants.ts`:
  - `FREE_WATCHLIST_LIMIT = 20`
  - `FREE_HISTORY_DAYS = 30`
  - `FREE_ALERTS_PER_SET = 1`
  - `PREMIUM_HISTORY_DAYS = 365`
  - `FREE_ALERT_TYPES = ['below_base_price']`
  - `PREMIUM_ALERT_TYPES = ['below_base_price', 'below_delivered_price', 'percent_drop_30d', 'lowest_90d']`

## 2. Plan Check Hooks

- [x] Create `src/features/premium/api.ts`:
  - `fetchUserPlan(userId)` — query `user_plans` table
  - `hasPremiumAccess()` — active/past_due = premium; canceled with future `current_period_end` = premium
  - `initiateCheckout()` — opens `EXPO_PUBLIC_PREMIUM_CHECKOUT_URL` via `WebBrowser.openBrowserAsync`
  - `openTermsOfService()`, `openPrivacyPolicy()`, `getPaywallLinks()`
- [x] Create `src/features/premium/hooks.ts`:
  - `useUserPlan()` — React Query hook, queryKey `['user-plan', user?.id]`
  - `useIsPremium()` — returns `{ isPremium: boolean, ...queryState }`
  - `useEntitlements()` — returns `{ entitlements: { watchlistLimit, historyDays, alertsPerSet, alertTypes }, ...queryState }`; `null` limits = unlimited (premium)
- [x] Create `src/features/premium/types.ts`:
  - `UserPlan` type with `isPremium`, `isExpired`, `isPastDue`, `resolvedPlan`
  - `Entitlements` type with `watchlistLimit: number | null`, `historyDays: 30 | 365`, `alertsPerSet: number | null`, `alertTypes: readonly string[]`

## 3. Free-Tier Limit Enforcement (Client)

- [x] Update watchlist add flow:
  - `WatchlistList.tsx` uses `useEntitlements()`, shows `UpgradePrompt` when count ≥ `watchlistLimit`
  - Display count shown in watchlist header
- [x] Update alert creation flow:
  - `PremiumBadge` shown next to non-free alert types
  - Alert type locked if not in `alertTypes` entitlement
- [x] Update price history chart:
  - `app/set/[setNum].tsx` passes `maxHistoryDays` derived from entitlements
  - Locked history taps open paywall modal

## 4. Free-Tier Limit Enforcement (Server)

- [x] Update `get_set_detail` Edge Function:
  - Accepts optional `user_id` parameter
  - `resolveAllowedHistoryDays(supabase, userId?)` queries `user_plans`; caps to 30 (free) or 365 (premium)
  - `effectiveHistoryDays = Math.min(input.include_history_days, allowedHistoryDays)`
- [x] Add server-side watchlist + alert limit checks via DB triggers:
  - `supabase/migrations/00009_premium_limits.sql`
  - `user_has_premium_access(target_user_id uuid)` — stable security definer function
  - `enforce_watchlist_plan_limit()` — BEFORE INSERT on `watchlists`; blocks when free user has ≥ 20 items
  - `enforce_alert_plan_limit()` — BEFORE INSERT OR UPDATE on `alerts`; blocks premium alert types for free users, enforces 1 alert per item limit
  - Triggers: `trg_watchlists_plan_limit`, `trg_alerts_plan_limit`

## 5. Paywall Screen

- [x] Create `app/modal/paywall.tsx`:
  - Premium feature highlights: unlimited watchlist, 365-day history, advanced alerts
  - Pricing display: EUR 2.99/month + EUR 19/year
  - Expired premium banner and past_due payment warning
  - "Start Free Trial / Subscribe" or "Request Premium Access" CTA (depends on checkout URL config)
  - "Restore Purchase" (stub with alert)
  - "Not now" dismiss
  - Terms of service + privacy policy links
- [x] Create `src/features/premium/components/PremiumBadge.tsx`:
  - Interactive (taps to `/modal/paywall`) or static badge chip
- [x] Create `src/features/premium/components/UpgradePrompt.tsx`:
  - Inline prompt with configurable title, description, CTA label
  - Navigates to `/modal/paywall`

## 6. Subscription Integration (Stub — Option B: Manual Entitlements)

- [x] Beta approach: admin sets `user_plans.plan = 'premium'` directly in Supabase dashboard
- [x] `initiateCheckout()` opens `EXPO_PUBLIC_PREMIUM_CHECKOUT_URL` if set, else shows informative error
- [x] App Store / Play Billing deferred to a later phase
- [ ] ~~Stripe webhook~~ — explicitly deferred; no `stripe_webhook` edge function in v1

## 7. Plan Status Handling

- [x] Handle plan expiry:
  - `isExpired` computed in `api.ts`: `status === 'canceled'` and `currentPeriodEnd` in the past
  - Expired premium banner shown in `paywall.tsx`
- [x] Handle `past_due` status:
  - `isPastDue` flag on `UserPlan`; premium access still granted during grace period
  - Payment warning shown in `paywall.tsx`

---

## Verification

- [ ] Free user is limited to 20 watchlist items (requires live auth + DB)
- [ ] Attempting to add 21st item shows paywall (requires live auth + DB)
- [ ] Free user only sees 30-day price history (requires live history data)
- [ ] Free user can only create `below_base_price` alerts (requires live auth)
- [ ] Premium user has no watchlist limit (requires `user_plans` row with `plan='premium'`)
- [ ] Premium user sees 365-day price history option
- [ ] Premium user can create all alert types
- [ ] Paywall screen renders correctly with pricing
- [ ] Stub subscription: manually set premium via Supabase dashboard → app updates
- [ ] Plan changes reflect in app after query invalidation
- [ ] Expired premium reverts to free limits
