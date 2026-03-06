# PriBrix — Contributing Guide

This guide explains how developers and AI agents should contribute to the PriBrix project.

## Development Philosophy

PriBrix is built with a **modular, feature‑based architecture** and a **data‑driven backend**.

Key principles:

- small focused commits
- strongly typed code
- reusable modules
- database‑driven features

## Branching Model

Recommended branches:

```
main
  production ready

dev
  integration branch

feature/<name>
  new feature work

fix/<name>
  bug fixes
```

## Commit Style

Use conventional commit style.

Examples:

```
feat: add watchlist screen
fix: correct price calculation
refactor: move supabase queries into api module
```

## Pull Request Checklist

Before merging a PR ensure:

- code compiles
- no TypeScript errors
- no unused dependencies
- feature follows folder structure

Checklist:

- [ ] code builds
- [ ] lint passes
- [ ] feature tested locally
- [ ] no console logs left

## Feature Development Workflow

1. Create feature branch
2. Implement API layer
3. Implement hooks
4. Build UI components
5. Connect screen

Example structure:

```
src/features/watchlist/
  api.ts
  hooks.ts
  types.ts
  components/
```

## Database Changes

Database modifications must:

- use migrations
- never modify production tables directly

Folder:

```
supabase/migrations/
```

## Edge Functions

Edge Functions live in:

```
supabase/functions/
```

Rules:

- input validation required
- return JSON
- log ingestion errors

## Mobile Development

Requirements:

- Expo SDK
- TypeScript strict mode
- React Query for network state

Run project:

```
npm install
npx expo start
```

## Testing

Test the following flows:

- search sets
- view set detail
- add to watchlist
- migrate lists after login

## Documentation

Documentation must stay updated in:

```
docs/
```

Important files:

- architecture
- roadmap
- PRD

## Code Review Guidelines

Reviewers should verify:

- architecture consistency
- security (RLS safe)
- performance impact

Avoid introducing:

- direct DB queries in UI
- duplicated logic
- unnecessary dependencies

