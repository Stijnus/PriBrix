# Phase 8 — Alerts v1 (Free) + Push

**Goal:** Enable push notification alerts when a watched set drops below a user's target price. Includes push token registration, server-side alert evaluation, and an alerts history screen.

**Prerequisites:** Phase 5 (auth working), Phase 6 (ingestion running + best prices updated daily)

**Status: IMPLEMENTED** ✓ Source verified 2026-03-07. All mobile and server-side code is in place. lint + typecheck + web export pass. Pending: deploy updated edge functions (401 in CLI session) + end-to-end live device verification.

---

## 1. Push Token Registration (Mobile)

- [x] Create `src/features/alerts/utils/pushToken.ts`:
  - Request push notification permissions (`expo-notifications`)
  - Get Expo push token
  - Handle permission denied gracefully (returns null)
  - Android notification channel (`price-alerts`) created on first request
  - Token refresh listener via `listenForPushTokenChanges`
- [x] Create `src/features/alerts/api.ts`:
  - `registerPushToken(userId, token, platform)` — upsert into `push_tokens`
  - `unregisterPushToken(token)` — delete from `push_tokens`
- [x] Wire token registration into auth flow (`src/lib/auth/session.tsx` line 145):
  - `syncPushToken()` runs after sign-in (userId effect)
  - Token refresh listener registered; cleans up on sign-out
- [x] Handle token refresh:
  - `listenForPushTokenChanges` re-registers if Expo token changes

## 2. Alert Creation (Mobile)

- [x] Create `src/features/alerts/hooks.ts`:
  - `useAlerts(watchId)` — fetch alerts for a watchlist item
  - `useCreateAlert()` — mutation (upsert on watch_id + type)
  - `useUpdateAlert()` — mutation to update threshold/toggle
  - `useDeleteAlert()` — mutation to delete alert
- [x] Update Watchlist item UI (`src/features/watchlist/components/WatchlistList.tsx` line 25):
  - Inline price-alert config per watchlist row
  - Type: `below_base_price` (free tier, v1 only)
  - Threshold price input (EUR)
  - Toggle enabled/disabled
  - Shows current alert status: "Alert set at EUR X"
- [x] Gate behind auth:
  - Alerts screen shows "Sign in" CTA when unauthenticated

## 3. Alert Evaluation (Server)

- [x] Create `supabase/functions/_shared/alerts/runAlerts.ts` (line 157):
  - **Step 1**: Fetches all enabled alerts with watchlist + set info
  - **Step 2**: Compares `set_best_prices_daily.best_base_price` to `threshold_price` per country scope (BE / NL / *)
  - **Step 3**: Cooldown check — skips if `triggered_at + cooldown_hours > now()`
  - **Step 4**: Inserts `alert_events`; collects for push batch
  - **Step 5**: Fetches `push_tokens`, batches via `sendPushNotifications`, updates `sent_push = true` on success
  - Per-alert error isolation; logs failures without aborting run
- [x] Create `supabase/functions/run_alerts_after_ingest/index.ts`:
  - Manual/standalone entrypoint with `x-ingestion-secret` guard
  - Returns `{ evaluated_count, triggered_count, push_attempt_count, push_success_count }`

## 4. Trigger After Ingestion

- [x] **Option A chosen**: `ingest_daily_prices` calls `runAlertsAfterIngest` inline after `refreshCaches` (`supabase/functions/ingest_daily_prices/index.ts` line 367)
- [x] Documented in `docs/alerts.md`

## 5. Expo Push API Integration

- [x] Create `supabase/functions/_shared/push.ts` (line 29):
  - `sendPushNotifications(messages)` — chunks into batches of 100
  - Per-ticket error handling; logs failures without aborting
  - `DeviceNotRegistered` tokens deleted from `push_tokens` automatically
  - Android `channelId: 'price-alerts'` set on every message

## 6. Alerts History Screen (Mobile)

- [x] Create `app/(tabs)/alerts.tsx`:
  - FlatList of triggered alert events
  - Each row: set image, set name, trigger price, retailer, time ago (`AlertEventRow`)
  - Tap navigates to Set Detail (`/set/:set_num`)
  - Empty state: "No alerts triggered yet"
  - Pull-to-refresh
  - Auth gate: sign-in prompt when unauthenticated
- [x] `src/features/alerts/api.ts` — `fetchAlertEvents(userId)` — nested join: watchlists → alerts → alert_events → offers → retailers
- [x] `src/features/alerts/hooks.ts` — `useAlertEvents()` — React Query hook for alert history
- [x] `src/features/alerts/components/AlertEventRow.tsx` — set thumbnail, name, trigger price, retailer, time ago

## 7. Notification Handling (Mobile)

- [x] Notification tap navigates to Set Detail (`app/_layout.tsx` line 26):
  - `setNum` / `set_num` resolved from notification data payload
  - Deduplication via `lastNotificationIdRef` prevents double-navigation
- [x] `Notifications.setNotificationHandler` configured at root (banner + list display)
- [x] `expo-notifications` added to `package.json` + `app.config.ts` plugins

---

## Verification

- [ ] Push permission request appears on first login — **needs signed-in device build**
- [ ] Push token is saved in `push_tokens` table — **needs signed-in device build**
- [ ] Creating an alert from watchlist item saves to `alerts` table — **needs signed-in device build**
- [ ] Running `run_alerts_after_ingest` evaluates alerts correctly — **needs deployment (401 in CLI session; deploy via Supabase Dashboard or MCP)**
- [ ] Push notification is received when price drops below threshold — **needs deployment + live device**
- [ ] Cooldown is respected (no duplicate notifications within cooldown period) — **needs deployment + live device**
- [ ] Alert events appear in the Alerts history screen — **needs deployment + live device**
- [ ] Tapping a notification opens the correct Set Detail screen — **needs deployment + live device**
- [ ] Invalid/expired push tokens are cleaned up — **needs deployment + live device**
- [ ] Alert toggle (enable/disable) works correctly — **needs signed-in device build**

### Deployment Blockers

Both edge function deploys returned **401 Unauthorized** from the CLI session. To unblock:

```bash
# Option 1: deploy via Supabase Dashboard → Edge Functions → Deploy
# Option 2: re-authenticate CLI and redeploy
supabase login
supabase functions deploy ingest_daily_prices
supabase functions deploy run_alerts_after_ingest
```
