import { z } from 'zod';

import { OfferWithLatestSchema } from '@/src/lib/validation/offers';
import { BestPricesByCountrySchema, PriceHistoryPointSchema } from '@/src/lib/validation/prices';

export const SetSchema = z.object({
  id: z.string().uuid(),
  set_num: z.string().trim().min(1),
  name: z.string().trim().min(1),
  theme: z.string().trim().min(1),
  year: z.number().int().min(1949).max(2100),
  image_url: z.url().nullable(),
  msrp_eur: z.number().nonnegative().nullable(),
});

export const SetDetailFunctionResponseSchema = z.object({
  set: SetSchema,
  offers: z.array(OfferWithLatestSchema),
  best_prices: BestPricesByCountrySchema,
  price_history: z.array(PriceHistoryPointSchema),
});

export type Set = z.infer<typeof SetSchema>;
export type SetDetailFunctionResponse = z.infer<typeof SetDetailFunctionResponseSchema>;
