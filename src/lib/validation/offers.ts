import { z } from 'zod';

import { CountryCodeSchema, StockStatusSchema } from '@/src/types/app';

export const OfferSchema = z.object({
  id: z.string().uuid(),
  retailer_id: z.string().uuid(),
  set_id: z.string().uuid(),
  source_product_id: z.string().trim().min(1),
  ean: z.string().trim().min(8).nullable(),
  product_url: z.url(),
  title_raw: z.string().trim().min(1),
});

export const OfferWithLatestSchema = z.object({
  offer_id: z.string().uuid(),
  set_id: z.string().uuid(),
  retailer_name: z.string().trim().min(1),
  country: CountryCodeSchema,
  product_url: z.url(),
  title_raw: z.string().trim().min(1),
  ean: z.string().trim().min(8).nullable(),
  price: z.number().nonnegative().nullable(),
  shipping: z.number().nonnegative().nullable(),
  delivered_price: z.number().nonnegative().nullable(),
  stock_status: StockStatusSchema,
  captured_at: z.string().datetime().nullable(),
  last_seen_at: z.string().datetime().nullable(),
});

export type Offer = z.infer<typeof OfferSchema>;
export type OfferWithLatestRecord = z.infer<typeof OfferWithLatestSchema>;
