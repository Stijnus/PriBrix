import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import type { NormalizedProduct } from '../types.ts';

export async function addToMatchQueue(
  supabase: SupabaseClient,
  product: NormalizedProduct,
  suggestedSetId: string | null = null,
) {
  const { error } = await supabase.from('match_queue').upsert(
    {
      retailer_id: product.retailer_id,
      source_product_id: product.source_product_id,
      title_raw: product.title,
      ean: product.ean,
      suggested_set_id: suggestedSetId,
      status: 'open',
    },
    {
      onConflict: 'retailer_id,source_product_id',
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
