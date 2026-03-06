# Phase 5 — Auth + Sync + Migration

**Goal:** Add Supabase Auth (magic link), implement server-backed lists for logged-in users, and migrate local lists to the server on first login.

**Prerequisites:** Phase 3 (local lists working), Phase 1 (user tables + RLS)

---

## 1. Deep Link Configuration

- [ ] Update `app.config.ts`:
  - Set `scheme: "pribrix"` (for `pribrix://` deep links)
- [ ] Configure Supabase dashboard:
  - Site URL: `pribrix://`
  - Redirect URL: `pribrix://auth/verify`
- [ ] Test deep link opens app (on device/emulator)

## 2. Auth Screens

- [ ] Create `app/auth/sign-in.tsx`:
  - Email input field (validated format)
  - "Send Magic Link" button
  - Loading state while sending
  - Error display (invalid email, rate limited, etc.)
  - Link to "Why sign in?" explanation (alerts, sync)
  - Call `supabase.auth.signInWithOtp({ email })`
- [ ] Create `app/auth/verify.tsx`:
  - "Check your email" message with the entered email
  - "Resend" button with 60-second cooldown timer
  - Handle deep link callback (auto-verify when user taps email link)
  - Error state: "This link has expired. Request a new one."
  - Success: navigate to main app + trigger migration
- [ ] Create `src/features/auth/api.ts`:
  - `signInWithMagicLink(email)` — wraps `supabase.auth.signInWithOtp`
  - `signOut()` — wraps `supabase.auth.signOut`
  - `getSession()` — wraps `supabase.auth.getSession`
- [ ] Create `src/features/auth/hooks.ts`:
  - `useAuth()` — returns `{ user, signIn, signOut, isLoading }`
  - Derives from `useSession()` context

## 3. Session Provider Updates

- [ ] Update `src/lib/auth/session.tsx`:
  - Handle `onAuthStateChange` events properly:
    - `SIGNED_IN`: trigger list migration, update context
    - `SIGNED_OUT`: clear context, optionally clear local cache
    - `TOKEN_REFRESHED`: update session silently
  - Persist session across app restarts (AsyncStorage adapter in Supabase client)

## 4. Server-Backed List APIs

- [ ] Create `src/features/watchlist/api.ts`:
  - `fetchServerWatchlist(userId)` — SELECT from `watchlists` + join sets
  - `addToServerWatchlist(userId, setId, country)` — INSERT
  - `removeFromServerWatchlist(watchId)` — DELETE
- [ ] Create `src/features/watchlist/hooks.ts` (update):
  - `useWatchlist()` — returns local OR server list based on auth state
  - When logged in: use React Query + server API
  - When logged out: use local AsyncStorage hook
- [ ] Create `src/features/wishlist/api.ts`:
  - `fetchServerWishlist(userId)` — SELECT from `user_wishlist_sets` + join sets
  - `addToServerWishlist(userId, setId, priority, notes)` — INSERT
  - `removeFromServerWishlist(id)` — DELETE
  - `updateServerWishlistItem(id, updates)` — UPDATE
- [ ] Create `src/features/wishlist/hooks.ts` (update):
  - `useWishlist()` — local OR server based on auth
- [ ] Create `src/features/owned/api.ts`:
  - `fetchServerOwned(userId)` — SELECT from `user_owned_sets` + join sets
  - `addToServerOwned(userId, setId, quantity, condition, ...)` — INSERT
  - `removeFromServerOwned(id)` — DELETE
  - `updateServerOwnedItem(id, updates)` — UPDATE
- [ ] Create `src/features/owned/hooks.ts` (update):
  - `useOwned()` — local OR server based on auth

## 5. Local-to-Server Migration

- [ ] Create `src/lib/migration/migrateLocalLists.ts`:
  - Use the migration utility from the plan (Section 19)
  - Steps:
    1. Read local_watchlist, local_wishlist, local_owned from AsyncStorage
    2. Resolve set_num -> set_id via Supabase
    3. Upsert watchlist items (with conflict handling)
    4. Create alerts from local target prices
    5. Upsert wishlist items
    6. Upsert owned items
    7. Clear local storage keys on success
  - Return migration result: counts + missing set_nums
- [ ] Wire migration into auth flow:
  - On `SIGNED_IN` event in session provider
  - Run migration once (use a flag in AsyncStorage: `migration_completed`)
  - Show brief toast: "Your lists have been synced"
  - Handle errors gracefully (don't block login)

## 6. Sign Out Flow

- [ ] Add "Sign Out" button to Settings screen
- [ ] On sign out:
  - Call `supabase.auth.signOut()`
  - Do NOT clear local lists (user might want them back if they sign in again)
  - Switch hooks back to local storage mode
  - Navigate to main screen

## 7. Auth CTA (Funnel)

- [ ] Add "Sign in" prompt in Settings when not logged in
- [ ] Add "Create account to enable alerts" CTA:
  - Show when user tries to create an alert on Watchlist
  - Show as banner in My LEGO screen when logged out
  - Navigates to `auth/sign-in`

## 8. UI Updates

- [ ] Update Settings screen:
  - Show user email when logged in
  - Show "Sign Out" button when logged in
  - Show "Sign In" button when logged out
- [ ] Update My LEGO screen:
  - Show sync indicator when using server lists
  - Show "Sign in to sync across devices" banner when logged out

---

## Verification

- [ ] Magic link email sends successfully
- [ ] Tapping email link opens app and signs user in
- [ ] "Resend" button is disabled for 60 seconds after sending
- [ ] Expired link shows appropriate error message
- [ ] Local lists migrate to server on first login (no duplicates)
- [ ] After migration, AsyncStorage local list keys are cleared
- [ ] Logged-in user sees server-backed lists
- [ ] Logged-out user sees local lists
- [ ] Adding/removing items works in both modes
- [ ] Sign out switches back to local mode
- [ ] RLS prevents accessing other users' data
