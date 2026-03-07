import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { addToMatchQueue } from './matchQueue.ts';
import { extractSetNum } from './extractSetNum.ts';
import type { NormalizedProduct } from '../types.ts';

type ResolveSetIdContext = {
  overrideCache: Map<string, string | null>;
  setNumCache: Map<string, string | null>;
  eanCache: Map<string, string | null>;
};

function getOverrideKey(retailerId: string, sourceProductId: string) {
  return `${retailerId}:${sourceProductId}`;
}

export async function resolveSetId(
  supabase: SupabaseClient,
  product: NormalizedProduct,
  context: ResolveSetIdContext,
) {
  const overrideKey = getOverrideKey(product.retailer_id, product.source_product_id);

  if (context.overrideCache.has(overrideKey)) {
    return context.overrideCache.get(overrideKey) ?? null;
  }

  const { data: overrideRow, error: overrideError } = await supabase
    .from('offer_set_overrides')
    .select('set_id')
    .eq('retailer_id', product.retailer_id)
    .eq('source_product_id', product.source_product_id)
    .maybeSingle();

  if (overrideError) {
    throw new Error(overrideError.message);
  }

  if (overrideRow?.set_id) {
    const overrideSetId = String(overrideRow.set_id);
    context.overrideCache.set(overrideKey, overrideSetId);
    return overrideSetId;
  }

  context.overrideCache.set(overrideKey, null);

  const extractedSetNum = extractSetNum(product.title);

  if (extractedSetNum) {
    if (context.setNumCache.has(extractedSetNum)) {
      const cachedSetId = context.setNumCache.get(extractedSetNum) ?? null;

      if (cachedSetId) {
        return cachedSetId;
      }
    } else {
      const { data: setRow, error: setError } = await supabase
        .from('sets')
        .select('id')
        .eq('set_num', extractedSetNum)
        .maybeSingle();

      if (setError) {
        throw new Error(setError.message);
      }

      const setId = setRow?.id ? String(setRow.id) : null;
      context.setNumCache.set(extractedSetNum, setId);

      if (setId) {
        return setId;
      }
    }
  }

  if (product.ean) {
    if (context.eanCache.has(product.ean)) {
      const cachedSetId = context.eanCache.get(product.ean) ?? null;

      if (cachedSetId) {
        return cachedSetId;
      }
    } else {
      const { data: offerRow, error: offerError } = await supabase
        .from('offers')
        .select('set_id')
        .eq('ean', product.ean)
        .limit(1)
        .maybeSingle();

      if (offerError) {
        throw new Error(offerError.message);
      }

      const setId = offerRow?.set_id ? String(offerRow.set_id) : null;
      context.eanCache.set(product.ean, setId);

      if (setId) {
        return setId;
      }
    }
  }

  await addToMatchQueue(supabase, product, null);
  return null;
}
