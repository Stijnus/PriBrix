import type { Offer } from '@/src/lib/validation/offers';

import { setsFixture } from './sets';

const retailerIds = {
  lego: '4b5cd7c0-0c4e-4d8a-b2b5-4abec6c26110',
  bol: '82412a6e-9c36-4c91-a90d-a20a4f8b5d89',
  amazon: '77f2ac1c-90d9-4b4d-8a64-a3719240d487',
} as const;

export const offersFixture: Offer[] = setsFixture.flatMap((set, index) => [
  {
    id: `${String(index + 1).padStart(8, '0')}-c593-4d8a-a9f1-000000000001`,
    retailer_id: retailerIds.lego,
    set_id: set.id,
    source_product_id: `lego-${set.set_num}`,
    ean: `5702017${String(index).padStart(5, '0')}`,
    product_url: `https://www.lego.com/product/${set.set_num.toLowerCase()}`,
    title_raw: `${set.name} ${set.set_num}`,
  },
  {
    id: `${String(index + 1).padStart(8, '0')}-c593-4d8a-a9f1-000000000002`,
    retailer_id: retailerIds.bol,
    set_id: set.id,
    source_product_id: `bol-${set.set_num}`,
    ean: `5702018${String(index).padStart(5, '0')}`,
    product_url: `https://www.bol.com/be/nl/p/${set.set_num.toLowerCase()}`,
    title_raw: `LEGO ${set.name} ${set.set_num}`,
  },
  {
    id: `${String(index + 1).padStart(8, '0')}-c593-4d8a-a9f1-000000000003`,
    retailer_id: retailerIds.amazon,
    set_id: set.id,
    source_product_id: `amazon-${set.set_num}`,
    ean: `5702019${String(index).padStart(5, '0')}`,
    product_url: `https://www.amazon.nl/dp/${set.set_num.toLowerCase()}`,
    title_raw: `LEGO set ${set.set_num} ${set.name}`,
  },
]);
