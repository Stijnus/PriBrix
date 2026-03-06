import { z } from 'zod';

export const AlertTypeSchema = z.enum([
  'below_base_price',
  'below_delivered_price',
  'percent_drop_30d',
  'lowest_90d',
]);

export const AlertSchema = z.object({
  id: z.string().uuid(),
  watch_id: z.string().uuid(),
  type: AlertTypeSchema,
  threshold_price: z.number().nonnegative().nullable(),
  threshold_percent: z.number().nonnegative().nullable(),
  cooldown_hours: z.number().int().min(1).max(720),
  is_enabled: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const AlertEventSchema = z.object({
  id: z.string().uuid(),
  alert_id: z.string().uuid(),
  offer_id: z.string().uuid().nullable(),
  trigger_price: z.number().nonnegative(),
  triggered_at: z.string().datetime(),
  sent_push: z.boolean(),
  sent_email: z.boolean(),
});

export type Alert = z.infer<typeof AlertSchema>;
export type AlertEvent = z.infer<typeof AlertEventSchema>;
