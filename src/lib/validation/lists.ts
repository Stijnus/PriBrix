import { z } from 'zod';

import { CountryCodeSchema, CountryScopeSchema, PrioritySchema } from '@/src/types/app';

const OwnedConditionSchema = z.enum(['sealed', 'used', 'incomplete']);

export const WatchlistItemSchema = z.object({
  id: z.string().uuid(),
  set_id: z.string().uuid(),
  country: CountryScopeSchema.default('*'),
  created_at: z.string().datetime({ offset: true }).optional(),
  updated_at: z.string().datetime({ offset: true }).optional(),
});

export const WishlistItemSchema = z.object({
  id: z.string().uuid(),
  set_id: z.string().uuid(),
  priority: PrioritySchema.default('medium'),
  target_base_price: z.number().nonnegative().nullable().optional(),
  target_delivered_price: z.number().nonnegative().nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  created_at: z.string().datetime({ offset: true }).optional(),
  updated_at: z.string().datetime({ offset: true }).optional(),
});

export const OwnedSetSchema = z.object({
  id: z.string().uuid(),
  set_id: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
  condition: OwnedConditionSchema.default('sealed'),
  box_condition: z.string().trim().max(100).nullable().optional(),
  purchase_price: z.number().nonnegative().nullable().optional(),
  purchase_date: z.string().date().nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  created_at: z.string().datetime({ offset: true }).optional(),
  updated_at: z.string().datetime({ offset: true }).optional(),
});

export const LocalWatchItemSchema = z.object({
  set_num: z.string().trim().min(1),
  country: CountryScopeSchema.optional(),
  target_base_price: z.number().nonnegative().optional(),
  target_delivered_price: z.number().nonnegative().optional(),
});

export const LocalWishlistItemSchema = z.object({
  set_num: z.string().trim().min(1),
  priority: PrioritySchema.optional(),
  target_base_price: z.number().nonnegative().optional(),
  target_delivered_price: z.number().nonnegative().optional(),
  notes: z.string().trim().max(500).optional(),
});

export const LocalOwnedItemSchema = z.object({
  set_num: z.string().trim().min(1),
  quantity: z.number().int().min(1).optional(),
  condition: OwnedConditionSchema.optional(),
  box_condition: z.string().trim().max(100).optional(),
  purchase_price: z.number().nonnegative().optional(),
  purchase_date: z.string().date().optional(),
  notes: z.string().trim().max(500).optional(),
});

export const LocalWatchItemArraySchema = z.array(LocalWatchItemSchema);
export const LocalWishlistItemArraySchema = z.array(LocalWishlistItemSchema);
export const LocalOwnedItemArraySchema = z.array(LocalOwnedItemSchema);

export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;
export type WishlistItem = z.infer<typeof WishlistItemSchema>;
export type OwnedSet = z.infer<typeof OwnedSetSchema>;
export type LocalWatchItem = z.infer<typeof LocalWatchItemSchema>;
export type LocalWishlistItem = z.infer<typeof LocalWishlistItemSchema>;
export type LocalOwnedItem = z.infer<typeof LocalOwnedItemSchema>;
export type CountryCode = z.infer<typeof CountryCodeSchema>;
