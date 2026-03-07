import type { FunctionsHttpError } from '@supabase/supabase-js';

import { OfferWithLatestSchema } from '@/src/lib/validation/offers';
import {
  BestPriceDailySchema,
  PriceHistoryPointSchema,
  type BestPriceSummary,
  type PriceHistoryPoint,
} from '@/src/lib/validation/prices';
import {
  SetDetailFunctionResponseSchema,
  SetSchema,
  type Set,
} from '@/src/lib/validation/sets';
import { hasSupabaseConfig, supabase } from '@/src/lib/supabase/client';
import type { CountryCode, CountryScope, StockStatus } from '@/src/types/app';

import { offersFixture } from '@/src/lib/mock/fixtures/offers';
import { priceHistoryFixture } from '@/src/lib/mock/fixtures/priceHistory';
import { setsFixture } from '@/src/lib/mock/fixtures/sets';

import type {
  CountryBestPrice,
  OfferWithLatest,
  PaginatedSetResult,
  SetDetail,
  SetSort,
  SetWithBestPrice,
} from './types';

type ParsedBestPriceRow = {
  setId: string;
  price: CountryBestPrice;
};

type SetDetailOptions = {
  country?: CountryScope;
  historyDays?: number;
  userId?: string;
};

const DEFAULT_HISTORY_DAYS = 90;
const ACTIVE_OFFER_WINDOW_DAYS = 7;

const mockRetailers = {
  '4b5cd7c0-0c4e-4d8a-b2b5-4abec6c26110': { name: 'LEGO.com BE', country: 'BE' as CountryCode, factor: 0.96, shipping: 0 },
  '82412a6e-9c36-4c91-a90d-a20a4f8b5d89': { name: 'bol.com BE', country: 'BE' as CountryCode, factor: 0.84, shipping: 2.99 },
  '77f2ac1c-90d9-4b4d-8a64-a3719240d487': { name: 'Amazon.nl', country: 'NL' as CountryCode, factor: 0.82, shipping: 4.99 },
} as const;

function parseSetRecord(record: Record<string, unknown>): Set {
  return SetSchema.parse({
    ...record,
    year: Number(record.year),
    msrp_eur: record.msrp_eur == null ? null : Number(record.msrp_eur),
  });
}

function parseBestPriceRecord(record: Record<string, unknown>): ParsedBestPriceRow {
  const parsed = BestPriceDailySchema.parse({
    ...record,
    best_base_price: record.best_base_price == null ? null : Number(record.best_base_price),
    best_delivered_price:
      record.best_delivered_price == null ? null : Number(record.best_delivered_price),
  });

  return {
    setId: String(record.set_id),
    price: {
      country: parsed.country,
      bestBasePrice: parsed.best_base_price,
      bestDeliveredPrice: parsed.best_delivered_price,
      bestBaseOfferId: parsed.best_base_offer_id,
      bestDeliveredOfferId: parsed.best_delivered_offer_id,
    },
  };
}

function buildBestPriceMap(bestPrices: CountryBestPrice[]) {
  return bestPrices.reduce<Partial<Record<CountryCode, CountryBestPrice>>>((accumulator, price) => {
    accumulator[price.country] = price;
    return accumulator;
  }, {});
}

function sortSets(items: SetWithBestPrice[], sort: SetSort, country: CountryCode) {
  return [...items].sort((left, right) => {
    if (sort === 'theme') {
      return left.theme.localeCompare(right.theme) || left.name.localeCompare(right.name);
    }

    if (sort === 'newest') {
      return right.year - left.year || left.name.localeCompare(right.name);
    }

    const leftPrice = left.bestPriceByCountry[country]?.bestBasePrice ?? Number.MAX_SAFE_INTEGER;
    const rightPrice = right.bestPriceByCountry[country]?.bestBasePrice ?? Number.MAX_SAFE_INTEGER;
    return leftPrice - rightPrice;
  });
}

function parseOfferWithLatestRecord(record: Record<string, unknown>): OfferWithLatest {
  return OfferWithLatestSchema.parse({
    ...record,
    price: record.price == null ? null : Number(record.price),
    shipping: record.shipping == null ? null : Number(record.shipping),
    delivered_price: record.delivered_price == null ? null : Number(record.delivered_price),
  });
}

function parsePriceHistoryPoint(record: Record<string, unknown>): PriceHistoryPoint {
  return PriceHistoryPointSchema.parse({
    ...record,
    min_base_price: record.min_base_price == null ? null : Number(record.min_base_price),
    min_delivered_price: record.min_delivered_price == null ? null : Number(record.min_delivered_price),
  });
}

function mapBestPriceSummary(country: CountryCode, summary: BestPriceSummary): CountryBestPrice {
  return {
    country,
    bestBasePrice: summary.best_base_price,
    bestDeliveredPrice: summary.best_delivered_price,
    bestBaseOfferId: summary.best_base_offer_id,
    bestDeliveredOfferId: summary.best_delivered_offer_id,
  };
}

function mapBestPricesRecord(
  bestPrices: Partial<Record<CountryCode, BestPriceSummary | undefined>>,
): Partial<Record<CountryCode, CountryBestPrice>> {
  const entries = (Object.entries(bestPrices) as [CountryCode, BestPriceSummary | undefined][])
    .filter((entry): entry is [CountryCode, BestPriceSummary] => entry[1] != null)
    .map(([country, summary]) => [country, mapBestPriceSummary(country, summary)] as const);

  return Object.fromEntries(entries);
}

function getIsoDateDaysAgo(days: number) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString().slice(0, 10);
}

function getIsoTimestampDaysAgo(days: number) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString();
}

function filterHistoryByDays(points: PriceHistoryPoint[], historyDays: number) {
  const startDate = getIsoDateDaysAgo(historyDays);
  return points.filter((point) => point.date >= startDate);
}

function isOfferActive(offer: OfferWithLatest, cutoffIso: string) {
  if (offer.stock_status !== 'out_of_stock') {
    return true;
  }

  return offer.last_seen_at != null && offer.last_seen_at >= cutoffIso;
}

function normalizeSetDetailFunctionResponse(payload: unknown): SetDetail {
  const parsed = SetDetailFunctionResponseSchema.parse(payload);

  return {
    set: parsed.set,
    offers: parsed.offers,
    bestPriceByCountry: mapBestPricesRecord(parsed.best_prices),
    priceHistory: parsed.price_history,
  };
}

function buildMockOffers(): OfferWithLatest[] {
  return offersFixture.map((offer, index) => {
    const set = setsFixture.find((entry) => entry.id === offer.set_id);
    const retailer = mockRetailers[offer.retailer_id as keyof typeof mockRetailers];

    if (!set || !retailer) {
      throw new Error(`Missing mock data for offer ${offer.id}`);
    }

    const price = Number((set.msrp_eur! * (retailer.factor - (index % 3) * 0.01)).toFixed(2));
    const shipping = retailer.shipping;
    const stockStatus: StockStatus = index % 5 === 0 ? 'unknown' : index % 4 === 0 ? 'out_of_stock' : 'in_stock';

    return {
      offer_id: offer.id,
      set_id: offer.set_id,
      retailer_name: retailer.name,
      country: retailer.country,
      product_url: offer.product_url,
      title_raw: offer.title_raw,
      ean: offer.ean,
      price,
      shipping,
      delivered_price: Number((price + shipping).toFixed(2)),
      stock_status: stockStatus,
      captured_at: new Date(Date.UTC(2026, 2, 1)).toISOString(),
      last_seen_at: new Date(Date.UTC(2026, 2, 1)).toISOString(),
    };
  });
}

const mockOffers = buildMockOffers();

function buildMockBestPricesForSet(setId: string) {
  const offers = mockOffers.filter((offer) => offer.set_id === setId);
  const byCountry = offers.reduce<Record<string, OfferWithLatest[]>>((accumulator, offer) => {
    accumulator[offer.country] ??= [];
    accumulator[offer.country].push(offer);
    return accumulator;
  }, {});

  return Object.entries(byCountry).map(([country, countryOffers]) => {
    const bestBaseOffer = [...countryOffers]
      .filter((offer) => offer.price != null)
      .sort((left, right) => (left.price ?? 0) - (right.price ?? 0))[0];
    const bestDeliveredOffer = [...countryOffers]
      .filter((offer) => offer.delivered_price != null)
      .sort((left, right) => (left.delivered_price ?? 0) - (right.delivered_price ?? 0))[0];

    return {
      country: country as CountryCode,
      bestBasePrice: bestBaseOffer?.price ?? null,
      bestDeliveredPrice: bestDeliveredOffer?.delivered_price ?? null,
      bestBaseOfferId: bestBaseOffer?.offer_id ?? null,
      bestDeliveredOfferId: bestDeliveredOffer?.offer_id ?? null,
    } satisfies CountryBestPrice;
  });
}

function buildMockSetWithBestPrices(set: Set): SetWithBestPrice {
  const bestPrices = buildMockBestPricesForSet(set.id);

  return {
    ...set,
    bestPriceByCountry: buildBestPriceMap(bestPrices),
  };
}

async function fetchSetsByIds(setIds: string[]) {
  if (!hasSupabaseConfig || setIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase.from('sets').select('*').in('id', setIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => parseSetRecord(row as Record<string, unknown>));
}

async function fetchBestPricesBySetIds(setIds: string[]) {
  if (!hasSupabaseConfig || setIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase.from('set_best_prices_daily').select('*').in('set_id', setIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => parseBestPriceRecord(row as Record<string, unknown>));
}

function buildBestPriceMapBySetId(rows: ParsedBestPriceRow[]) {
  return rows.reduce<Map<string, CountryBestPrice[]>>((accumulator, row) => {
    const current = accumulator.get(row.setId) ?? [];
    current.push(row.price);
    accumulator.set(row.setId, current);
    return accumulator;
  }, new Map());
}

export async function fetchSetDetailFromFunction(
  setNum: string,
  country: CountryScope,
  historyDays: number,
  userId?: string,
): Promise<SetDetail | null> {
  const { data, error } = await supabase.functions.invoke('get_set_detail', {
    body: {
      set_num: setNum,
      country,
      include_history_days: historyDays,
      user_id: userId,
    },
  });

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return normalizeSetDetailFunctionResponse(data);
}

export async function fetchSetsBySetNums(setNums: string[], preferMock = false): Promise<Set[]> {
  if (setNums.length === 0) {
    return [];
  }

  const uniqueSetNums = Array.from(new Set(setNums));

  if (preferMock || !hasSupabaseConfig) {
    const fixtureMap = new Map(setsFixture.map((set) => [set.set_num, set]));
    return uniqueSetNums.map((setNum) => fixtureMap.get(setNum)).filter(Boolean) as Set[];
  }

  const { data, error } = await supabase.from('sets').select('*').in('set_num', uniqueSetNums);

  if (error) {
    throw new Error(error.message);
  }

  const setMap = new Map(
    (data ?? []).map((row) => {
      const parsed = parseSetRecord(row as Record<string, unknown>);
      return [parsed.set_num, parsed] as const;
    }),
  );

  return uniqueSetNums.map((setNum) => setMap.get(setNum)).filter(Boolean) as Set[];
}

export async function fetchSetSummary(setNum: string, preferMock = false) {
  const [set] = await fetchSetsBySetNums([setNum], preferMock);
  return set ?? null;
}

export async function fetchBestPricesDaily(
  country: CountryCode,
  page: number,
  pageSize: number,
  sort: SetSort,
  preferMock = false,
): Promise<PaginatedSetResult> {
  if (preferMock || !hasSupabaseConfig) {
    const items = sortSets(setsFixture.map(buildMockSetWithBestPrices), sort, country);
    const start = page * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    return {
      items: pageItems,
      hasMore: start + pageSize < items.length,
    };
  }

  const rangeStart = page * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  if (sort === 'lowest-price') {
    const { data, error } = await supabase
      .from('set_best_prices_daily')
      .select('*')
      .eq('country', country)
      .order('best_base_price', { ascending: true, nullsFirst: false })
      .range(rangeStart, rangeEnd);

    if (error) {
      throw new Error(error.message);
    }

    const selectedBestPrices = (data ?? []).map((row) => parseBestPriceRecord(row as Record<string, unknown>));
    const uniqueSetIds = Array.from(new Set(selectedBestPrices.map((row) => row.setId)));
    const [sets, allBestPrices] = await Promise.all([
      fetchSetsByIds(uniqueSetIds),
      fetchBestPricesBySetIds(uniqueSetIds),
    ]);
    const setMap = new Map(sets.map((set) => [set.id, set]));
    const priceMap = buildBestPriceMapBySetId(allBestPrices);

    return {
      items: uniqueSetIds
        .map((setId) => {
          const set = setMap.get(setId);
          if (!set) {
            return null;
          }

          return {
            ...set,
            bestPriceByCountry: buildBestPriceMap(priceMap.get(setId) ?? []),
          } satisfies SetWithBestPrice;
        })
        .filter(Boolean) as SetWithBestPrice[],
      hasMore: (data ?? []).length === pageSize,
    };
  }

  const orderColumn = sort === 'newest' ? 'year' : 'theme';
  const ascending = sort === 'theme';

  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .order(orderColumn, { ascending })
    .order('name', { ascending: true })
    .range(rangeStart, rangeEnd);

  if (error) {
    throw new Error(error.message);
  }

  const sets = (data ?? []).map((row) => parseSetRecord(row as Record<string, unknown>));
  const bestPrices = await fetchBestPricesBySetIds(sets.map((set) => set.id));
  const priceMap = buildBestPriceMapBySetId(bestPrices);

  return {
    items: sets.map((set) => ({
      ...set,
      bestPriceByCountry: buildBestPriceMap(priceMap.get(set.id) ?? []),
    })),
    hasMore: (data ?? []).length === pageSize,
  };
}

function buildMockSetDetail(
  setNum: string,
  country: CountryScope = '*',
  historyDays = DEFAULT_HISTORY_DAYS,
): SetDetail | null {
  const set = setsFixture.find((entry) => entry.set_num === setNum);

  if (!set) {
    return null;
  }

  const offers = mockOffers
    .filter((offer) => offer.set_id === set.id)
    .filter((offer) => country === '*' || offer.country === country)
    .sort((left, right) => (left.price ?? Number.MAX_SAFE_INTEGER) - (right.price ?? Number.MAX_SAFE_INTEGER));

  return {
    set,
    offers,
    bestPriceByCountry: buildBestPriceMap(buildMockBestPricesForSet(set.id)),
    priceHistory: country === '*' ? [] : filterHistoryByDays(priceHistoryFixture[setNum] ?? [], historyDays),
  };
}

async function fetchSetDetailDirect(
  setNum: string,
  country: CountryScope = '*',
  historyDays = DEFAULT_HISTORY_DAYS,
): Promise<SetDetail | null> {
  const { data: setRow, error: setError } = await supabase.from('sets').select('*').eq('set_num', setNum).maybeSingle();

  if (setError) {
    throw new Error(setError.message);
  }

  if (!setRow) {
    return null;
  }

  const set = parseSetRecord(setRow as Record<string, unknown>);
  const activeOfferCutoff = getIsoTimestampDaysAgo(ACTIVE_OFFER_WINDOW_DAYS);
  const historyStart = getIsoDateDaysAgo(historyDays);

  const [bestPricesResponse, offersResponse, historyResponse] = await Promise.all([
    supabase.from('set_best_prices_daily').select('*').eq('set_id', set.id),
    (country === '*'
      ? supabase.from('set_offers_with_latest').select('*').eq('set_id', set.id)
      : supabase.from('set_offers_with_latest').select('*').eq('set_id', set.id).eq('country', country)).order('price', {
      ascending: true,
      nullsFirst: false,
    }),
    country === '*'
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('set_price_daily')
          .select('*')
          .eq('set_id', set.id)
          .eq('country', country)
          .gte('date', historyStart)
          .order('date', { ascending: true }),
  ]);

  if (bestPricesResponse.error) {
    throw new Error(bestPricesResponse.error.message);
  }

  if (offersResponse.error) {
    throw new Error(offersResponse.error.message);
  }

  if (historyResponse.error) {
    throw new Error(historyResponse.error.message);
  }

  const bestPrices = (bestPricesResponse.data ?? []).map((row) =>
    parseBestPriceRecord(row as Record<string, unknown>).price,
  );

  const offers = (offersResponse.data ?? [])
    .map((row) => parseOfferWithLatestRecord(row as Record<string, unknown>))
    .filter((offer) => isOfferActive(offer, activeOfferCutoff));
  const priceHistory =
    country === '*'
      ? []
      : (historyResponse.data ?? []).map((row) => parsePriceHistoryPoint(row as Record<string, unknown>));

  return {
    set,
    offers,
    bestPriceByCountry: buildBestPriceMap(bestPrices),
    priceHistory,
  };
}

function isFunctionUnavailable(error: unknown) {
  const maybeError = error as Partial<FunctionsHttpError> & { message?: string; name?: string };
  const message = maybeError.message?.toLowerCase() ?? '';

  return (
    maybeError.name === 'FunctionsFetchError' ||
    maybeError.name === 'FunctionsRelayError' ||
    message.includes('failed to send') ||
    message.includes('edge function returned a non-2xx status code') ||
    message.includes('function not found')
  );
}

export async function fetchSetDetail(
  setNum: string,
  options: SetDetailOptions = {},
  preferMock = false,
): Promise<SetDetail | null> {
  const country = options.country ?? '*';
  const historyDays = options.historyDays ?? DEFAULT_HISTORY_DAYS;

  if (preferMock || !hasSupabaseConfig) {
    return buildMockSetDetail(setNum, country, historyDays);
  }

  try {
    return await fetchSetDetailFromFunction(setNum, country, historyDays, options.userId);
  } catch (error) {
    if (!isFunctionUnavailable(error) && __DEV__) {
      console.warn('get_set_detail function failed, falling back to direct queries.', error);
    }

    return fetchSetDetailDirect(setNum, country, historyDays);
  }
}
