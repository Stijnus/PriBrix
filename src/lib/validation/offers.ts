import { z } from 'zod';

export const OfferSchema = z.object({
  id: z.string().uuid(),
  retailer_id: z.string().uuid(),
  set_id: z.string().uuid(),
  source_product_id: z.string().trim().min(1),
  ean: z.string().trim().min(8).nullable(),
  product_url: z.url(),
  title_raw: z.string().trim().min(1),
});

export type Offer = z.infer<typeof OfferSchema>;
