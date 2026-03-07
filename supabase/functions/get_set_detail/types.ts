import { z } from 'npm:zod@4.1.8';

export const GetSetDetailInputSchema = z.object({
  set_num: z.string().trim().min(1),
  country: z.enum(['BE', 'NL', '*']).default('*'),
  include_history_days: z.coerce.number().int().min(1).max(365).default(90),
  user_id: z.string().uuid().optional(),
});

export type GetSetDetailInput = z.infer<typeof GetSetDetailInputSchema>;
