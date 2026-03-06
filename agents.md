# PriBrix — AI Agent Development Rules

This file defines rules for AI coding agents working on the PriBrix repository.

Agents include:

- Claude Code
- OpenAI Codex
- Gemini agents
- Antigravity IDE agents

## Core Principles

1. Follow the **database schema defined in the system design documents**.
2. Do not introduce new tables unless justified.
3. Maintain **type safety with TypeScript strict mode**.
4. Prefer **pure functions and modular architecture**.

## Non‑Negotiable Constraints

### No retailer scraping

The mobile app must **never scrape retailer websites**.

All price data must come from:

- affiliate product feeds
- authorized APIs

### Mobile is read‑only for price data

Mobile client:

- reads Supabase tables
- calls Edge Functions

It never writes pricing data.

### Anonymous first design

Users must be able to use the app without login.

Anonymous users store:

- watchlist
- wishlist
- owned sets

in local storage.

### Sync after login

When a user logs in:

- local lists migrate to Supabase
- duplicates must be avoided

## Coding Style

### Feature modules

All features must follow this structure:

```
src/features/<feature>/
  api.ts
  hooks.ts
  types.ts
  components/
```

### Data access

All Supabase queries must be wrapped inside:

```
src/features/*/api.ts
```

UI components must not directly call Supabase.

### React Query

Data fetching must use:

TanStack Query

Benefits:

- caching
- retries
- background refresh

## Mobile UI Rules

- Avoid heavy lists without pagination
- Images must be cached
- Charts must use aggregated data

Never render thousands of raw price points.

### Styling

All components must use **NativeWind v4** (Tailwind utility classes via `className`).

Do not use React Native `StyleSheet.create` except for edge cases NativeWind cannot handle (e.g. animated transforms).

Design tokens are defined in `tailwind.config.js`. Do not hardcode color hex values inline.

### Affiliate links

All outbound retailer links must be opened with **`expo-web-browser`** (`WebBrowser.openBrowserAsync`).

Do not use `Linking.openURL` for affiliate URLs. The in-app browser keeps the user in the app and improves attribution.

### Data validation

All Edge Function inputs and outputs must be validated with **Zod**.

Shared Zod schemas live in:

```
src/lib/validation/
  sets.ts
  offers.ts
  prices.ts
  alerts.ts
```

UI components must never receive raw unvalidated API data.

Edge functions must:

- validate inputs
- return typed JSON
- never expose internal tables unnecessarily

Recommended pattern:

```
functions/
  get_set_detail/
  ingest_daily_prices/
  run_alerts_after_ingest/
```

## Security

Agents must respect **Row Level Security**.

Never bypass RLS with client credentials.

Server operations must use:

Supabase service role key.

## Performance Guidelines

Prefer:

- cached tables
- aggregated data

Avoid:

- scanning large snapshot tables

## Acceptance Criteria

Generated code must:

- compile with TypeScript strict mode
- follow repository folder structure
- avoid duplicated logic

If uncertain, consult:

- ARCHITECTURE.md
- project PRD

