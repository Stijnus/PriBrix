# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PriBrix is a mobile LEGO price tracking app for Belgium (BE) and Netherlands (NL). Users browse sets, compare retailer prices, track price history, and get alerts on price drops. The app is anonymous-first (works fully without login) and monetized through affiliate links + premium tier.

## Tech Stack

- **Mobile**: Expo SDK 54, React Native 0.81, TypeScript strict, Expo Router
- **Styling**: NativeWind v4 (Tailwind classes via `className` props — no `StyleSheet.create` except rare edge cases)
- **Data fetching**: TanStack React Query
- **Local storage**: AsyncStorage (anonymous user lists + preferences)
- **Charts**: react-native-gifted-charts (aggregated daily data only, never raw snapshots)
- **Affiliate links**: expo-web-browser (`WebBrowser.openBrowserAsync`, NOT `Linking.openURL`)
- **Validation**: Zod schemas in `src/lib/validation/`
- **Backend**: Supabase (Postgres + Auth + Edge Functions + Scheduled Jobs, Deno runtime)

## Architecture

Feature-based modules — each feature follows this pattern:
```
src/features/<feature>/
  api.ts          # All Supabase queries (UI never calls Supabase directly)
  hooks.ts        # React Query hooks
  types.ts        # TypeScript types
  components/     # UI components
```

Key data flow: Retailer Feeds → Ingestion Edge Functions → Supabase Postgres → Read-Optimized Cache Tables → Mobile App (React Query)

Anonymous users store watchlist/wishlist/owned in AsyncStorage. On login, local lists migrate to Supabase server tables. Hooks (`useWatchlist`, etc.) return local or server data based on auth state.

## Non-Negotiable Constraints

- **No retailer scraping** — all prices from authorized affiliate feeds/APIs only
- **Mobile is read-only** for pricing data — ingestion runs server-side only
- **Anonymous-first** — must work fully without login (browse, search, detail, local lists)
- **RLS enforced** — user data private via Supabase Row Level Security
- **Aggregated data only** — never send raw snapshot series to mobile
- **NativeWind only** — all styling via `className`, design tokens in `tailwind.config.js`
- **Zod validation** — all API inputs/outputs validated; shared schemas in `src/lib/validation/`

## Design System

See `project/design-system.md` for complete color tokens, typography, spacing, and component patterns.

- **Primary**: Amber/orange (#F58A07) — brick-inspired, distinct from LEGO branding
- **Accent**: Teal (#14B8A6)
- **Neutrals**: Slate scale (neutral-50 to neutral-950)
- **Price colors**: `price-drop` (green), `price-up` (red)
- **Dark mode**: via NativeWind `dark:` prefix classes

## Key Documentation

| Document | Purpose |
|----------|---------|
| `project/project_context.md` | AI quick-start (1-2 page summary) |
| `project/architecture.md` | System architecture, data flow, deployment |
| `project/agents.md` | AI agent coding rules and constraints |
| `project/contributing.md` | Branching, commits, PR checklist, workflow |
| `project/design-system.md` | Colors, typography, spacing, component patterns, Tailwind config |
| `project/benelux_lego_price_tracker_plan.md` | Full product spec, schema SQL, starter code |
| `project/pri_brix_roadmap_phases_ai_todo_lists.md` | High-level phased roadmap |
| `project/phases/phase-*.md` | Detailed per-phase checklists with file paths |

## Database Schema (Core Tables)

**Public read**: `sets`, `retailers`, `set_best_prices_daily`, `offers`, `price_snapshots`
**User-owned (RLS)**: `watchlists`, `alerts`, `alert_events`, `push_tokens`, `user_owned_sets`, `user_wishlist_sets`, `user_plans`
**Ops/service-role**: `match_queue`, `offer_set_overrides`, `ingestion_runs`, `set_price_daily`

Full SQL in `project/benelux_lego_price_tracker_plan.md` Section 18.

## Edge Functions

- `get_set_detail` — returns set + offers + best prices + aggregated history in one call
- `ingest_daily_prices` — scheduled daily; downloads feeds, maps products to sets, inserts snapshots, recomputes caches
- `run_alerts_after_ingest` — evaluates price alerts, applies cooldown, sends Expo push notifications

## Conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, etc.
- Branching: `main` (prod), `dev` (integration), `feature/*`, `fix/*`
- No direct Supabase calls in UI components — all queries go through `api.ts` + `hooks.ts`
- Price formatting: EUR with comma decimal (`EUR 89,99`) per Benelux conventions
- All outbound affiliate links via `WebBrowser.openBrowserAsync`

## Build Phases

The project follows a 10-phase build sequence. See `project/phases/` for detailed checklists:
Phase 0 (bootstrap) → 1 (schema) → 2 (catalog import) → 3 (mobile MVP) → 4 (set detail API) → 6 (ingestion) → 8 (alerts) → 5 (auth/sync) → 10 (release) → 9 (premium) → 7 (admin)
