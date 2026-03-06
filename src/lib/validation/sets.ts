import { z } from 'zod';

export const SetSchema = z.object({
  id: z.string().uuid(),
  set_num: z.string().trim().min(1),
  name: z.string().trim().min(1),
  theme: z.string().trim().min(1),
  year: z.number().int().min(1949).max(2100),
  image_url: z.url().nullable(),
  msrp_eur: z.number().nonnegative().nullable(),
});

export type Set = z.infer<typeof SetSchema>;
