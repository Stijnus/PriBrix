import { type LocalWatchItem, WatchlistItemSchema } from '@/src/lib/validation/lists';
import { fetchSetsBySetNums } from '@/src/features/sets/api';
import { supabase } from '@/src/lib/supabase/client';

export type ServerWatchlistEntry = LocalWatchItem & {
  id: string;
  set_id: string;
  created_at?: string;
  updated_at?: string;
};

type WatchlistAlertType = 'below_base_price' | 'below_delivered_price';

function getJoinedSetNum(row: { sets?: { set_num: string } | { set_num: string }[] | null }) {
  if (Array.isArray(row.sets)) {
    return row.sets[0]?.set_num ?? '';
  }

  return row.sets?.set_num ?? '';
}

function parseServerWatchlistRow(
  row: Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
): ServerWatchlistEntry {
  const setNum = getJoinedSetNum(row);

  return {
    ...WatchlistItemSchema.parse({
      id: String(row.id),
      set_id: String(row.set_id),
      country: String(row.country ?? '*'),
      created_at: row.created_at ? String(row.created_at) : undefined,
      updated_at: row.updated_at ? String(row.updated_at) : undefined,
    }),
    set_num: setNum,
  };
}

async function resolveSetId(setNum: string) {
  const [set] = await fetchSetsBySetNums([setNum]);

  if (!set) {
    throw new Error(`Set ${setNum} could not be resolved.`);
  }

  return set.id;
}

async function upsertWatchAlert(watchId: string, type: WatchlistAlertType, thresholdPrice: number | undefined) {
  if (thresholdPrice == null) {
    return;
  }

  const { error } = await supabase.from('alerts').upsert(
    {
      watch_id: watchId,
      type,
      threshold_price: thresholdPrice,
    },
    {
      onConflict: 'watch_id,type',
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchServerWatchlist(userId: string): Promise<ServerWatchlistEntry[]> {
  const { data, error } = await supabase
    .from('watchlists')
    .select('id,set_id,country,created_at,updated_at,sets!inner(set_num)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    parseServerWatchlistRow(row as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null }),
  );
}

export async function addToServerWatchlist(userId: string, item: LocalWatchItem): Promise<ServerWatchlistEntry> {
  const setId = await resolveSetId(item.set_num);

  const { data, error } = await supabase
    .from('watchlists')
    .upsert(
      {
        user_id: userId,
        set_id: setId,
        country: item.country ?? '*',
      },
      {
        onConflict: 'user_id,set_id,country',
      },
    )
    .select('id,set_id,country,created_at,updated_at,sets!inner(set_num)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const parsed = parseServerWatchlistRow(
    data as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
  );

  await Promise.all([
    upsertWatchAlert(parsed.id, 'below_base_price', item.target_base_price),
    upsertWatchAlert(parsed.id, 'below_delivered_price', item.target_delivered_price),
  ]);

  return parsed;
}

export async function removeFromServerWatchlist(watchId: string) {
  const { error } = await supabase.from('watchlists').delete().eq('id', watchId);

  if (error) {
    throw new Error(error.message);
  }
}
