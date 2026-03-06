# Phase 9 — Premium v1 (Entitlements + Paywall)

**Goal:** Implement free-tier limits and a premium subscription that unlocks unlimited watchlist, longer price history, and additional alert types.

**Prerequisites:** Phase 5 (auth), Phase 8 (alerts working)

---

## 1. Entitlement Definition

- [ ] Define free vs premium limits:

  | Feature | Free | Premium |
  |---------|------|---------|
  | Watchlist items | 20 | Unlimited |
  | Alerts per set | 1 | Multiple |
  | Alert types | below_base_price only | All types |
  | Price history | 30 days | 365 days |
  | Delivered-price alerts | No | Yes |

- [ ] Create `src/features/premium/constants.ts`:
  - `FREE_WATCHLIST_LIMIT = 20`
  - `FREE_HISTORY_DAYS = 30`
  - `FREE_ALERTS_PER_SET = 1`
  - `PREMIUM_HISTORY_DAYS = 365`
  - `FREE_ALERT_TYPES = ['below_base_price']`
  - `PREMIUM_ALERT_TYPES = ['below_base_price', 'below_delivered_price', 'percent_drop_30d', 'lowest_90d']`

## 2. Plan Check Hooks

- [ ] Create `src/features/premium/api.ts`:
  - `fetchUserPlan(userId)` — query `user_plans` table
- [ ] Create `src/features/premium/hooks.ts`:
  - `useUserPlan()` — React Query hook returning current plan
  - `useIsPremium()` — boolean shorthand
  - `useEntitlements()` — returns resolved limits based on plan:
    - `{ watchlistLimit, historyDays, alertsPerSet, alertTypes }`
- [ ] Create `src/features/premium/types.ts`:
  - `UserPlan` type
  - `Entitlements` type

## 3. Free-Tier Limit Enforcement (Client)

- [ ] Update watchlist add flow:
  - Before adding: check current watchlist count vs `watchlistLimit`
  - If at limit: show paywall instead of adding
  - Display count: "12 / 20 watch slots used"
- [ ] Update alert creation flow:
  - If alert type not in allowed types: show paywall
  - If alerts per set at limit: show paywall
- [ ] Update price history chart:
  - Pass `historyDays` from entitlements to `get_set_detail`
  - If premium: show 365d option
  - If free: show only 30d, grey out 90d/365d with "Premium" badge

## 4. Free-Tier Limit Enforcement (Server)

- [ ] Update `get_set_detail` Edge Function:
  - Accept optional `user_id` parameter
  - If user is free: cap `include_history_days` to 30
  - If user is premium: allow up to 365
- [ ] Add server-side watchlist limit check:
  - In watchlist INSERT RLS or trigger: check count < limit based on plan
  - Or validate in a helper Edge Function

## 5. Paywall Screen

- [ ] Create `app/modal/paywall.tsx`:
  - Premium feature highlights:
    - "Unlimited watchlist"
    - "365-day price history"
    - "Advanced alerts (delivered price, % drops)"
  - Pricing display: 2.99 EUR/month or 19 EUR/year
  - "Start Free Trial" / "Subscribe" button
  - "Restore Purchase" link
  - "Not now" dismiss button
  - Terms of service + privacy policy links
- [ ] Create `src/features/premium/components/PremiumBadge.tsx`:
  - Small badge/chip shown next to premium features
  - Tap opens paywall
- [ ] Create `src/features/premium/components/UpgradePrompt.tsx`:
  - Inline prompt shown when user hits a limit
  - "Upgrade to Premium to unlock..."
  - CTA button opens paywall

## 6. Subscription Integration (Stub)

- [ ] For v1, stub the payment flow:
  - Option A: Stripe web checkout
    - Open Stripe checkout URL in in-app browser
    - Webhook updates `user_plans` on successful payment
  - Option B: Manual/test entitlements
    - Admin can set `user_plans.plan = 'premium'` directly
    - Useful for beta testers
  - Note: App Store / Play Billing integration is a later task
- [ ] Create `src/features/premium/api.ts` (extend):
  - `initiateCheckout()` — opens Stripe checkout or placeholder
- [ ] If using Stripe webhooks:
  - Create `supabase/functions/stripe_webhook/index.ts`:
    - Verify Stripe signature
    - On `checkout.session.completed`: update `user_plans` to premium
    - On `customer.subscription.deleted`: update to free/canceled
    - Set `current_period_end`

## 7. Plan Status Handling

- [ ] Handle plan expiry:
  - If `current_period_end < now()` and `status != active`: treat as free
  - Show "Your premium has expired" message
  - Offer re-subscribe option
- [ ] Handle `past_due` status:
  - Show warning: "Payment issue — update your payment method"
  - Still allow premium access for grace period

---

## Verification

- [ ] Free user is limited to 20 watchlist items
- [ ] Attempting to add 21st item shows paywall
- [ ] Free user only sees 30-day price history
- [ ] Free user can only create `below_base_price` alerts
- [ ] Premium user has no watchlist limit
- [ ] Premium user sees 365-day price history option
- [ ] Premium user can create all alert types
- [ ] Paywall screen renders correctly with pricing
- [ ] Stub subscription flow works (can manually set premium)
- [ ] Plan changes reflect immediately in app behavior
- [ ] Expired premium reverts to free limits
