import type { PriceHistoryPoint } from '@/src/lib/validation/prices';

export const priceHistoryFixture: Record<string, PriceHistoryPoint[]> = {
  '10316-1': [
    { date: '2025-12-01', min_base_price: 449.99, min_delivered_price: 449.99 },
    { date: '2026-01-01', min_base_price: 439.99, min_delivered_price: 439.99 },
    { date: '2026-02-01', min_base_price: 429.99, min_delivered_price: 434.99 },
  ],
  '42146-1': [
    { date: '2025-12-01', min_base_price: 479.99, min_delivered_price: 484.99 },
    { date: '2026-01-01', min_base_price: 459.99, min_delivered_price: 464.99 },
    { date: '2026-02-01', min_base_price: 449.99, min_delivered_price: 454.99 },
  ],
  '75331-1': [
    { date: '2025-12-01', min_base_price: 229.99, min_delivered_price: 234.99 },
    { date: '2026-01-01', min_base_price: 214.99, min_delivered_price: 219.99 },
    { date: '2026-02-01', min_base_price: 209.99, min_delivered_price: 214.99 },
  ],
};
