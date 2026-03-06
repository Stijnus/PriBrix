import { createClient } from '@supabase/supabase-js';

import type { ImportStats, NormalizedSet } from './types';

const UPSERT_BATCH_SIZE = 500;

function getServiceRoleClient() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL. Add it to .env before running the catalog import.');
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env before running the catalog import.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

export async function upsertSets(normalizedSets: NormalizedSet[], dryRun: boolean): Promise<ImportStats> {
  const stats: ImportStats = {
    fetched: normalizedSets.length,
    normalized: normalizedSets.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
  };

  if (dryRun) {
    return stats;
  }

  const supabase = getServiceRoleClient();

  for (const batch of chunkArray(normalizedSets, UPSERT_BATCH_SIZE)) {
    const setNums = batch.map((set) => set.set_num);

    const { data: existingSets, error: existingSetsError } = await supabase
      .from('sets')
      .select('set_num')
      .in('set_num', setNums);

    if (existingSetsError) {
      throw new Error(`Failed to inspect existing sets: ${existingSetsError.message}`);
    }

    const existingSetNums = new Set((existingSets ?? []).map((row) => row.set_num));

    const { error: upsertError } = await supabase.from('sets').upsert(batch, {
      onConflict: 'set_num',
      ignoreDuplicates: false,
    });

    if (upsertError) {
      throw new Error(`Failed to upsert sets: ${upsertError.message}`);
    }

    for (const set of batch) {
      if (existingSetNums.has(set.set_num)) {
        stats.updated += 1;
      } else {
        stats.inserted += 1;
      }
    }
  }

  return stats;
}
