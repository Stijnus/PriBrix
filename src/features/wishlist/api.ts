import { type LocalWishlistItem, WishlistItemSchema } from '@/src/lib/validation/lists';
import { fetchSetsBySetNums } from '@/src/features/sets/api';
import { supabase } from '@/src/lib/supabase/client';

export type ServerWishlistEntry = LocalWishlistItem & {
  id: string;
  set_id: string;
  created_at?: string;
  updated_at?: string;
};

function getJoinedSetNum(row: { sets?: { set_num: string } | { set_num: string }[] | null }) {
  if (Array.isArray(row.sets)) {
    return row.sets[0]?.set_num ?? '';
  }

  return row.sets?.set_num ?? '';
}

function parseServerWishlistRow(
  row: Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
): ServerWishlistEntry {
  const parsed = WishlistItemSchema.parse({
    id: String(row.id),
    set_id: String(row.set_id),
    priority: row.priority ? String(row.priority) : undefined,
    target_base_price: row.target_base_price == null ? undefined : Number(row.target_base_price),
    target_delivered_price:
      row.target_delivered_price == null ? undefined : Number(row.target_delivered_price),
    notes: row.notes == null ? undefined : String(row.notes),
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  });

  return {
    ...parsed,
    target_base_price: parsed.target_base_price ?? undefined,
    target_delivered_price: parsed.target_delivered_price ?? undefined,
    notes: parsed.notes ?? undefined,
    set_num: getJoinedSetNum(row),
  };
}

async function resolveSetId(setNum: string) {
  const [set] = await fetchSetsBySetNums([setNum]);

  if (!set) {
    throw new Error(`Set ${setNum} could not be resolved.`);
  }

  return set.id;
}

export async function fetchServerWishlist(userId: string): Promise<ServerWishlistEntry[]> {
  const { data, error } = await supabase
    .from('user_wishlist_sets')
    .select('id,set_id,priority,target_base_price,target_delivered_price,notes,created_at,updated_at,sets!inner(set_num)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    parseServerWishlistRow(row as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null }),
  );
}

export async function addToServerWishlist(userId: string, item: LocalWishlistItem): Promise<ServerWishlistEntry> {
  const setId = await resolveSetId(item.set_num);

  const { data, error } = await supabase
    .from('user_wishlist_sets')
    .upsert(
      {
        user_id: userId,
        set_id: setId,
        priority: item.priority ?? 'medium',
        target_base_price: item.target_base_price ?? null,
        target_delivered_price: item.target_delivered_price ?? null,
        notes: item.notes ?? null,
      },
      {
        onConflict: 'user_id,set_id',
      },
    )
    .select('id,set_id,priority,target_base_price,target_delivered_price,notes,created_at,updated_at,sets!inner(set_num)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return parseServerWishlistRow(
    data as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
  );
}

export async function updateServerWishlistItem(id: string, updates: Partial<LocalWishlistItem>) {
  const payload: Record<string, unknown> = {};

  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.target_base_price !== undefined) payload.target_base_price = updates.target_base_price;
  if (updates.target_delivered_price !== undefined) payload.target_delivered_price = updates.target_delivered_price;
  if (updates.notes !== undefined) payload.notes = updates.notes ?? null;

  const { data, error } = await supabase
    .from('user_wishlist_sets')
    .update(payload)
    .eq('id', id)
    .select('id,set_id,priority,target_base_price,target_delivered_price,notes,created_at,updated_at,sets!inner(set_num)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return parseServerWishlistRow(
    data as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
  );
}

export async function removeFromServerWishlist(id: string) {
  const { error } = await supabase.from('user_wishlist_sets').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
