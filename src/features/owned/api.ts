import { type LocalOwnedItem, OwnedSetSchema } from '@/src/lib/validation/lists';
import { fetchSetsBySetNums } from '@/src/features/sets/api';
import { supabase } from '@/src/lib/supabase/client';

export type ServerOwnedEntry = LocalOwnedItem & {
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

function parseServerOwnedRow(
  row: Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
): ServerOwnedEntry {
  const parsed = OwnedSetSchema.parse({
    id: String(row.id),
    set_id: String(row.set_id),
    quantity: row.quantity == null ? undefined : Number(row.quantity),
    condition: row.condition ? String(row.condition) : undefined,
    box_condition: row.box_condition == null ? undefined : String(row.box_condition),
    purchase_price: row.purchase_price == null ? undefined : Number(row.purchase_price),
    purchase_date: row.purchase_date == null ? undefined : String(row.purchase_date),
    notes: row.notes == null ? undefined : String(row.notes),
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  });

  return {
    ...parsed,
    box_condition: parsed.box_condition ?? undefined,
    purchase_price: parsed.purchase_price ?? undefined,
    purchase_date: parsed.purchase_date ?? undefined,
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

export async function fetchServerOwned(userId: string): Promise<ServerOwnedEntry[]> {
  const { data, error } = await supabase
    .from('user_owned_sets')
    .select('id,set_id,quantity,condition,box_condition,purchase_price,purchase_date,notes,created_at,updated_at,sets!inner(set_num)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    parseServerOwnedRow(row as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null }),
  );
}

export async function addToServerOwned(userId: string, item: LocalOwnedItem): Promise<ServerOwnedEntry> {
  const setId = await resolveSetId(item.set_num);

  const { data, error } = await supabase
    .from('user_owned_sets')
    .upsert(
      {
        user_id: userId,
        set_id: setId,
        quantity: item.quantity ?? 1,
        condition: item.condition ?? 'sealed',
        box_condition: item.box_condition ?? null,
        purchase_price: item.purchase_price ?? null,
        purchase_date: item.purchase_date ?? null,
        notes: item.notes ?? null,
      },
      {
        onConflict: 'user_id,set_id',
      },
    )
    .select('id,set_id,quantity,condition,box_condition,purchase_price,purchase_date,notes,created_at,updated_at,sets!inner(set_num)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return parseServerOwnedRow(
    data as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
  );
}

export async function updateServerOwnedItem(id: string, updates: Partial<LocalOwnedItem>) {
  const payload: Record<string, unknown> = {};

  if (updates.quantity !== undefined) payload.quantity = updates.quantity;
  if (updates.condition !== undefined) payload.condition = updates.condition;
  if (updates.box_condition !== undefined) payload.box_condition = updates.box_condition ?? null;
  if (updates.purchase_price !== undefined) payload.purchase_price = updates.purchase_price ?? null;
  if (updates.purchase_date !== undefined) payload.purchase_date = updates.purchase_date ?? null;
  if (updates.notes !== undefined) payload.notes = updates.notes ?? null;

  const { data, error } = await supabase
    .from('user_owned_sets')
    .update(payload)
    .eq('id', id)
    .select('id,set_id,quantity,condition,box_condition,purchase_price,purchase_date,notes,created_at,updated_at,sets!inner(set_num)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return parseServerOwnedRow(
    data as Record<string, unknown> & { sets?: { set_num: string } | { set_num: string }[] | null },
  );
}

export async function removeFromServerOwned(id: string) {
  const { error } = await supabase.from('user_owned_sets').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
