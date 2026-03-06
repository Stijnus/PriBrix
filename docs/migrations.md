# PriBrix Migrations

This repository uses SQL migration files in [`supabase/migrations`](/Users/stijnus/Github/PriBrix/supabase/migrations) as the source of truth for the database schema.

## Local workflow

1. Start local Supabase if it is configured:

```bash
npx supabase start
```

2. Reset the local database and apply all migrations:

```bash
npx supabase db reset
```

3. Apply pending migrations without a full reset when appropriate:

```bash
npx supabase migration up
```

4. Seed the local database after migrations if needed:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/seed_retailers.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/seed_sets.sql
```

## Staging and production

Use the Supabase CLI against the target project:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

If seed data needs to be applied in a hosted environment, run the seed SQL manually in the SQL editor or execute it with `psql` against the target database.

## Creating new migrations

Create a new numbered migration file in `supabase/migrations/` and keep schema concerns separated by purpose:

- core tables
- views
- RLS and grants
- operational tables

Prefer additive migrations. Do not rewrite old migration files after they have been applied to a shared environment.
