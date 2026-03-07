import { SetSchema, type Set } from '@/src/lib/validation/sets';
import { hasSupabaseConfig, supabase } from '@/src/lib/supabase/client';
import { setsFixture } from '@/src/lib/mock/fixtures/sets';

function parseSetRecord(record: Record<string, unknown>): Set {
  return SetSchema.parse({
    ...record,
    year: Number(record.year),
    msrp_eur: record.msrp_eur == null ? null : Number(record.msrp_eur),
  });
}

function sortResults(results: Set[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return [...results].sort((left, right) => {
    const leftExact = left.set_num.toLowerCase() === normalizedQuery ? 0 : 1;
    const rightExact = right.set_num.toLowerCase() === normalizedQuery ? 0 : 1;

    if (leftExact !== rightExact) {
      return leftExact - rightExact;
    }

    return left.name.localeCompare(right.name);
  });
}

export async function searchSets(query: string, preferMock = false): Promise<Set[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  if (preferMock || !hasSupabaseConfig) {
    return sortResults(
      setsFixture.filter((set) => {
        const haystack = `${set.set_num} ${set.name}`.toLowerCase();
        return haystack.includes(normalizedQuery.toLowerCase());
      }),
      normalizedQuery,
    );
  }

  const [exactMatchResponse, nameMatchResponse] = await Promise.all([
    supabase.from('sets').select('*').eq('set_num', normalizedQuery).limit(1),
    supabase.from('sets').select('*').ilike('name', `%${normalizedQuery}%`).limit(24),
  ]);

  if (exactMatchResponse.error) {
    throw new Error(exactMatchResponse.error.message);
  }

  if (nameMatchResponse.error) {
    throw new Error(nameMatchResponse.error.message);
  }

  const merged = new Map<string, Set>();

  for (const row of [...(exactMatchResponse.data ?? []), ...(nameMatchResponse.data ?? [])]) {
    const parsed = parseSetRecord(row as Record<string, unknown>);
    merged.set(parsed.set_num, parsed);
  }

  return sortResults(Array.from(merged.values()), normalizedQuery);
}
