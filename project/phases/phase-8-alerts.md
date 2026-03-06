# Phase 8 — Alerts v1 (Free) + Push

**Goal:** Enable push notification alerts when a watched set drops below a user's target price. Includes push token registration, server-side alert evaluation, and an alerts history screen.

**Prerequisites:** Phase 5 (auth working), Phase 6 (ingestion running + best prices updated daily)

---

## 1. Push Token Registration (Mobile)

- [ ] Create `src/features/alerts/utils/pushToken.ts`:
  - Request push notification permissions (`expo-notifications`)
  - Get Expo push token
  - Handle permission denied gracefully
- [ ] Create `src/features/alerts/api.ts`:
  - `registerPushToken(userId, token, platform)` — upsert into `push_tokens`
  - `unregisterPushToken(token)` — delete from `push_tokens`
- [ ] Wire token registration into auth flow:
  - After successful sign-in, request permissions + register token
  - On sign-out, optionally unregister token
- [ ] Handle token refresh:
  - Re-register if token changes (Expo tokens can change)

## 2. Alert Creation (Mobile)

- [ ] Create `src/features/alerts/hooks.ts`:
  - `useAlerts(watchId)` — fetch alerts for a watchlist item
  - `useCreateAlert()` — mutation to create new alert
  - `useUpdateAlert()` — mutation to update threshold/toggle
  - `useDeleteAlert()` — mutation to delete alert
- [ ] Update Watchlist item UI:
  - "Set Alert" button on each watchlist item
  - Alert config form:
    - Type: `below_base_price` (free tier, only option in v1)
    - Threshold price input (EUR)
    - Toggle enabled/disabled
  - Show current alert status: "Alert set at EUR X"
- [ ] Gate behind auth:
  - If not logged in, show "Create account to enable alerts" CTA
  - Navigate to sign-in flow

## 3. Alert Evaluation (Server)

- [ ] Create `supabase/functions/run_alerts_after_ingest/index.ts`:
  - **Step 1**: Fetch all enabled alerts with watchlist + set info:
    ```sql
    SELECT a.*, w.set_id, w.country, w.user_id
    FROM alerts a
    JOIN watchlists w ON w.id = a.watch_id
    WHERE a.is_enabled = true
    ```
  - **Step 2**: For each alert, get current best price:
    - `below_base_price`: compare `set_best_prices_daily.best_base_price` to `a.threshold_price`
    - Match country scope (BE, NL, or * = either)
  - **Step 3**: Check cooldown:
    - Query last `alert_event` for this alert
    - Skip if `triggered_at + cooldown_hours > now()`
  - **Step 4**: If triggered:
    - Insert `alert_event` (alert_id, offer_id, trigger_price, triggered_at, sent_push: false)
    - Collect for push notification batch
  - **Step 5**: Send push notifications:
    - Fetch `push_tokens` for each triggered user
    - Batch send via Expo Push API (`https://exp.host/--/api/v2/push/send`)
    - Message format: "Price drop! [Set Name] is now EUR X at [Retailer]"
    - Update `alert_event.sent_push = true` on success
  - **Error handling**: Don't fail entire run if one push fails; log errors

## 4. Trigger After Ingestion

- [ ] Wire `run_alerts_after_ingest` to run after `ingest_daily_prices`:
  - Option A: Call from within ingestion function at the end
  - Option B: Separate scheduled function running 30 min after ingestion
  - Option C: Database trigger on `set_best_prices_daily` update (not recommended for performance)
- [ ] Document the chosen approach

## 5. Expo Push API Integration

- [ ] Create `supabase/functions/_shared/push.ts`:
  - `sendPushNotifications(messages)` — batch send to Expo Push API
  - Handle response: check for errors per token
  - Handle invalid tokens: remove from `push_tokens` if `DeviceNotRegistered`
  - Respect Expo Push API rate limits

## 6. Alerts History Screen (Mobile)

- [ ] Create `app/(tabs)/alerts.tsx` (or add as tab/section):
  - List of triggered alerts (from `alert_events`)
  - Each row: set image, set name, trigger price, retailer, triggered_at
  - Tap navigates to Set Detail
  - Empty state: "No alerts triggered yet"
  - Pull-to-refresh
- [ ] Create `src/features/alerts/api.ts` (extend):
  - `fetchAlertEvents(userId)` — query alert_events via alerts -> watchlists
- [ ] Create `src/features/alerts/hooks.ts` (extend):
  - `useAlertEvents()` — React Query hook for alert history
- [ ] Create `src/features/alerts/components/AlertEventRow.tsx`:
  - Set thumbnail, name, triggered price, retailer, time ago

## 7. Notification Handling (Mobile)

- [ ] Handle notification tap:
  - When user taps push notification, navigate to Set Detail screen
  - Pass `setNum` in notification data payload
- [ ] Configure notification listeners in `app/_layout.tsx`:
  - `Notifications.addNotificationResponseReceivedListener`
  - Parse notification data and navigate accordingly

---

## Verification

- [ ] Push permission request appears on first login
- [ ] Push token is saved in `push_tokens` table
- [ ] Creating an alert from watchlist item saves to `alerts` table
- [ ] Running `run_alerts_after_ingest` evaluates alerts correctly
- [ ] Push notification is received when price drops below threshold
- [ ] Cooldown is respected (no duplicate notifications within cooldown period)
- [ ] Alert events appear in the Alerts history screen
- [ ] Tapping a notification opens the correct Set Detail screen
- [ ] Invalid/expired push tokens are cleaned up
- [ ] Alert toggle (enable/disable) works correctly
