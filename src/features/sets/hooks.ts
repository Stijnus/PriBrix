import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useMockMode } from '@/src/hooks/useMockMode';
import { type CountryCode, type CountryScope } from '@/src/types/app';
import { isClientRuntime } from '@/src/utils/runtime';

import {
  fetchBestPricesDaily,
  fetchSetDetail,
  fetchSetSummary,
  fetchSetsWithBestPricesBySetNums,
} from './api';
import type { SetSort, SetWithBestPrice } from './types';

const PAGE_SIZE = 12;

export function useBestPricesDaily(country: CountryCode, sort: SetSort) {
  const { isMockMode } = useMockMode();
  const clientRuntime = isClientRuntime();

  return useInfiniteQuery({
    queryKey: ['best-prices', country, sort, isMockMode],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchBestPricesDaily(country, pageParam, PAGE_SIZE, sort, isMockMode),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: clientRuntime,
  });
}

export function useSetDetail(
  setNum: string,
  options: {
    country: CountryScope;
    historyDays: number;
    userId?: string;
  },
) {
  const { isMockMode } = useMockMode();
  const clientRuntime = isClientRuntime();

  return useQuery({
    queryKey: ['set-detail', setNum, options.country, options.historyDays, options.userId, isMockMode],
    queryFn: () => fetchSetDetail(setNum, options, isMockMode),
    enabled: clientRuntime && setNum.length > 0,
    placeholderData: (previousData) => previousData,
  });
}

export function useSetSummary(setNum: string) {
  const { isMockMode } = useMockMode();
  const clientRuntime = isClientRuntime();

  return useQuery({
    queryKey: ['set-summary', setNum, isMockMode],
    queryFn: () => fetchSetSummary(setNum, isMockMode),
    enabled: clientRuntime && setNum.length > 0,
  });
}

export function useSetsWithBestPrices(setNums: string[], enabled = true) {
  const { isMockMode } = useMockMode();
  const clientRuntime = isClientRuntime();
  const stableSetNums = Array.from(new Set(setNums));

  return useQuery({
    queryKey: ['sets-with-best-prices', stableSetNums.join(','), isMockMode],
    queryFn: () => fetchSetsWithBestPricesBySetNums(stableSetNums, isMockMode),
    enabled: clientRuntime && enabled && stableSetNums.length > 0,
    initialData: [] as SetWithBestPrice[],
  });
}
