import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import type { NormalizedProduct, StockStatus } from '../../types.ts';

const MOCK_SOURCE = 'mock';
const DEFAULT_MSRP = 29.99;
const SET_LIMIT = 300;

// Deterministic pseudo-random from integer seed — no external deps needed.
function rand(seed: number): number {
  const x = Math.sin(seed + 1) * 10_000;
  return x - Math.floor(x);
}

function mockPrice(msrp: number, seed: number): number {
  // 85–105 % of MSRP, rounded to nearest cent
  const factor = 0.85 + rand(seed) * 0.20;
  return Math.round(msrp * factor * 100) / 100;
}

function mockShipping(seed: number): number | null {
  const r = rand(seed);
  if (r < 0.50) return 0;       // free shipping
  if (r < 0.80) return 3.99;    // standard shipping
  return null;                  // unknown
}

function mockStockStatus(seed: number): StockStatus {
  const r = rand(seed);
  if (r < 0.85) return 'in_stock';
  if (r < 0.95) return 'out_of_stock';
  return 'unknown';
}

export async function generateMockProducts(supabase: SupabaseClient): Promise<NormalizedProduct[]> {
  const [setsResult, retailersResult] = await Promise.all([
    supabase
      .from('sets')
      .select('id, set_num, name, msrp_eur')
      .limit(SET_LIMIT)
      .order('year', { ascending: false }),
    supabase
      .from('retailers')
      .select('id, name, country'),
  ]);

  if (setsResult.error) throw new Error(setsResult.error.message);
  if (retailersResult.error) throw new Error(retailersResult.error.message);

  const sets = setsResult.data ?? [];
  const retailers = retailersResult.data ?? [];

  const products: NormalizedProduct[] = [];

  for (let si = 0; si < sets.length; si++) {
    const set = sets[si];
    const msrp = set.msrp_eur != null ? Number(set.msrp_eur) : DEFAULT_MSRP;

    for (let ri = 0; ri < retailers.length; ri++) {
      const retailer = retailers[ri];
      const seed = si * 1000 + ri;

      // Skip ~30 % of set/retailer combos to simulate realistic assortment gaps
      if (rand(seed + 500) < 0.30) continue;

      products.push({
        source: MOCK_SOURCE,
        retailer_id: String(retailer.id),
        // Title uses set_num so extractSetNum() resolves the match automatically
        source_product_id: `mock-${String(set.id)}-${String(retailer.id)}`,
        title: `LEGO ${set.set_num} ${String(set.name)}`,
        ean: null,
        price: mockPrice(msrp, seed),
        shipping: mockShipping(seed + 1),
        stock_status: mockStockStatus(seed + 2),
        product_url: `https://mock.example.com/lego/${set.set_num}`,
      });
    }
  }

  return products;
}
