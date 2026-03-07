# PriBrix

![CI](https://github.com/stijnus/PriBrix/workflows/ci/badge.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue)
![Expo](https://img.shields.io/badge/Expo-54-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

**Mobile LEGO price tracker for Belgium & Netherlands**

Browse the best prices per LEGO set, compare across retailers, track price history, build your collection, and get alerts when prices drop.

Current repo milestone: **internal beta**. The mobile app is feature-complete for beta flows, but production rollout still depends on live affiliate feed onboarding, physical-device QA, and final release operations.

---

## Features

- 🏪 **Browse & Compare** — Find the best prices across retailers for any LEGO set
- 📊 **Price History** — See daily price trends over time
- 📋 **Personal Collections** — Owned, Wishlist, and Watchlist (local or synced)
- 🔔 **Price Alerts** — Get notified when a set drops below your threshold
- 👤 **Anonymous-First** — Browse, search, and manage lists without login
- 🔐 **Secure Login** — Sync your lists and enable alerts across devices
- 🎁 **Premium Tier** — Unlimited watchlist + longer history + more alerts
- 🇧🇪 🇳🇱 **Benelux Support** — Belgium (EUR, Dutch/French) + Netherlands (EUR)

---

## Tech Stack

### Mobile
- **Framework**: Expo SDK 54 + React Native 0.81
- **Language**: TypeScript (strict mode)
- **Router**: Expo Router
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Data Fetching**: TanStack React Query v5
- **Local Storage**: AsyncStorage
- **Charts**: react-native-gifted-charts
- **Links**: expo-web-browser (affiliate link handling)
- **Validation**: Zod schemas

### Backend
- **Database**: Supabase (Postgres)
- **Auth**: Supabase Auth
- **Edge Functions**: Deno runtime
- **Scheduled Jobs**: Supabase cron triggers

### Data Sources
- **Set Catalog**: Rebrickable (primary)
- **Price Feeds**: bol.com + affiliate networks (Awin, Daisycon, TradeTracker, etc.)

---

## Project Structure

```
PriBrix/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (providers)
│   └── (tabs)/                   # Tab navigation
│       ├── index.tsx             # Home/Browse
│       ├── search.tsx            # Search
│       ├── my-lego.tsx           # Collections (Owned/Wishlist/Watched)
│       └── settings.tsx          # Settings
├── src/
│   ├── features/                 # Feature modules (Phase 3+)
│   ├── lib/
│   │   ├── auth/                 # Auth context + useSession hook
│   │   ├── supabase/             # Supabase client
│   │   ├── validation/           # Zod schemas
│   │   ├── storage/              # AsyncStorage helpers
│   │   ├── mock/                 # Mock fixtures for dev
│   │   └── queryClient.ts        # TanStack Query config
│   ├── components/               # Shared UI components
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # Global TypeScript types
│   └── utils/                    # Utilities (price formatting, etc.)
├── supabase/
│   ├── migrations/               # SQL migrations (Phase 1)
│   ├── functions/                # Edge functions (Phase 4+)
│   └── seed/                     # Seed data
├── project/                      # Project documentation
│   ├── architecture.md           # System design & data flow
│   ├── design-system.md          # Colors, typography, tokens
│   ├── contributing.md           # Branching, commits, PR workflow
│   ├── project_context.md        # Quick-start context
│   └── phases/                   # Detailed per-phase checklists
├── assets/                       # Icons, fonts, images
├── .github/workflows/ci.yml      # GitHub Actions CI
├── package.json
├── tsconfig.json                 # TypeScript strict
├── tailwind.config.js            # NativeWind design tokens
├── app.config.ts                 # Expo configuration
└── .env.example                  # Environment variables template
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn (or pnpm)
- Expo CLI: `npm install -g expo-cli`
- A Supabase project (for backend)

### Clone & Install
```bash
git clone https://github.com/stijnus/PriBrix.git
cd PriBrix
npm install
```

### Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_ENV=dev
EXPO_PUBLIC_DEFAULT_COUNTRY=BE
```

### Run the App
```bash
npx expo start
```

Then:
- **iOS**: Press `i` in the terminal to open in Simulator
- **Android**: Press `a` for Android Emulator
- **Web**: Press `w` for web browser
- **Scan QR code** with Expo Go app on a physical device

### Scripts
```bash
npm run lint        # ESLint check
npm run format      # Prettier format
npm run typecheck   # TypeScript strict check
```

---

## Architecture

PriBrix uses a **feature-based module structure** with clear separation of concerns:

- **UI Components** → **Hooks** → **API layer** → **Supabase queries**
- **Anonymous-first**: Local AsyncStorage lists for unauthed users
- **Synced lists**: Server-side storage after login + RLS security
- **Read-only mobile**: Pricing data is ingested server-side only
- **Aggregated data only**: Mobile receives daily best prices + history, never raw snapshots

For detailed architecture, see [project/architecture.md](project/architecture.md).

---

## Build Phases

| Phase | Title | Status | Notes |
|-------|-------|--------|-------|
| 0 | Repo Bootstrap & Tooling | ✅ Done | Tooling, Expo Router, NativeWind, CI |
| 1 | Supabase Schema & RLS | ✅ Done | Schema, RLS, seeds, migration docs |
| 2 | Catalog Import | ✅ Done | Rebrickable import, retail filtering, catalog loaded |
| 3 | Mobile Anonymous MVP | ✅ Done | Browse, search, set detail, local lists |
| 4 | Set Detail API | ✅ Done | `get_set_detail` live and wired in mobile |
| 5 | Auth & List Sync | ✅ Done | Magic-link auth, migration, synced lists |
| 6 | Daily Price Ingestion | ✅ Done | Ingestion + cache refresh live; mock feed supported |
| 7 | Admin Tooling | ✅ Done | Studio/SQL admin workflow for match queue and overrides |
| 8 | Alerts & Push | 🟡 Beta verification | Functions live; physical-device push QA still pending |
| 9 | Premium Tier | 🟡 Manual beta | Entitlements and paywall shipped; billing remains stubbed |
| 10 | Release Readiness | 🟡 Internal beta | Legal, analytics, Sentry, and beta docs in repo; device QA remains |

See [project/phases/](project/phases/) for detailed per-phase checklists.

## Internal Beta Blockers

- Real retailer data still depends on affiliate approvals and Edge Function feed secrets.
- `delete_user_data` still needs to be deployed live to match the repo.
- Sentry environment variables are not configured yet.
- Physical-device QA and preview EAS builds are still required before tester rollout.

---

## Contributing

Contributions welcome! Please follow our conventions:

### Branching
- `main` — production releases
- `dev` — integration branch (when added)
- `feature/<name>` — new features
- `fix/<name>` — bug fixes

### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add price alert notification
fix: correct watchlist sync bug
refactor: extract PriceCard component
docs: update architecture diagram
```

### Code Standards
- TypeScript strict mode (no `any`)
- NativeWind for all styling (no StyleSheet.create)
- Zod validation at API boundaries
- No Supabase queries in UI components (use `api.ts` + `hooks.ts`)
- Affiliate links via `expo-web-browser`

For more details, see [project/contributing.md](project/contributing.md).

---

## Design System

All colors, typography, spacing, and component patterns are defined in [project/design-system.md](project/design-system.md) and Tailwind config.

**Brand Colors**:
- **Primary**: Amber/Orange (`#F58A07`) — brick-inspired, distinct from LEGO branding
- **Accent**: Teal (`#14B8A6`)
- **Neutrals**: Slate scale
- **Price**: Green (drop) / Red (up)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | AI coding instructions |
| [project/project_context.md](project/project_context.md) | 1-2 page quick-start |
| [project/architecture.md](project/architecture.md) | System design & data flow |
| [project/design-system.md](project/design-system.md) | UI colors, typography, spacing |
| [project/contributing.md](project/contributing.md) | Branching, commits, PR checklist |
| [project/benelux_lego_price_tracker_plan.md](project/benelux_lego_price_tracker_plan.md) | Full spec + schema SQL + starter code |
| [project/phases/](project/phases/) | Per-phase detailed checklists |

---

## Legal

**PriBrix is not affiliated with or endorsed by the LEGO Group.** LEGO is a trademark of the LEGO Group of companies.

All retailer names and logos are the property of their respective owners.

---

## License

[TBD — add your license here (MIT, GPL, etc.)]

---

**Questions?** Open an issue or check the [project docs](project/).
