import { z } from 'zod';

import { CountryCodeSchema, StockStatusSchema } from '@/src/types/app';

export const PriceSnapshotSchema = z.object({
  id: z.string().uuid(),
  offer_id: z.string().uuid(),
  price: z.number().nonnegative(),
  shipping: z.number().nonnegative().nullable(),
  stock_status: StockStatusSchema,
  captured_at: z.string().datetime(),
});

export const BestPriceDailySchema = z.object({
  set_id: z.string().uuid(),
  country: CountryCodeSchema,
  best_base_price: z.number().nonnegative().nullable(),
  best_base_offer_id: z.string().uuid().nullable(),
  best_delivered_price: z.number().nonnegative().nullable(),
  best_delivered_offer_id: z.string().uuid().nullable(),
  updated_at: z.string().datetime(),
});

export const PriceHistoryPointSchema = z.object({
  date: z.string().date(),
  min_base_price: z.number().nonnegative().nullable(),
  min_delivered_price: z.number().nonnegative().nullable(),
});

export type PriceSnapshot = z.infer<typeof PriceSnapshotSchema>;
export type BestPriceDaily = z.infer<typeof BestPriceDailySchema>;
export type PriceHistoryPoint = z.infer<typeof PriceHistoryPointSchema>;
