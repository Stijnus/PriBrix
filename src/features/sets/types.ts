import type { Set } from '@/src/lib/validation/sets';
import type { PriceHistoryPoint } from '@/src/lib/validation/prices';
import type { CountryCode, StockStatus } from '@/src/types/app';

export type SetSort = 'lowest-price' | 'newest' | 'theme';

export type CountryBestPrice = {
  country: CountryCode;
  bestBasePrice: number | null;
  bestDeliveredPrice: number | null;
  bestBaseOfferId: string | null;
  bestDeliveredOfferId: string | null;
};

export type SetWithBestPrice = Set & {
  bestPriceByCountry: Partial<Record<CountryCode, CountryBestPrice>>;
};

export type OfferWithLatest = {
  offer_id: string;
  set_id: string;
  retailer_name: string;
  country: CountryCode;
  product_url: string;
  title_raw: string;
  ean: string | null;
  price: number | null;
  shipping: number | null;
  delivered_price: number | null;
  stock_status: StockStatus;
  captured_at: string | null;
  last_seen_at: string | null;
};

export type SetDetail = {
  set: Set;
  offers: OfferWithLatest[];
  bestPriceByCountry: Partial<Record<CountryCode, CountryBestPrice>>;
  priceHistory: PriceHistoryPoint[];
};

export type PaginatedSetResult = {
  items: SetWithBestPrice[];
  hasMore: boolean;
};
