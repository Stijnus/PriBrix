import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useMockMode } from '@/src/hooks/useMockMode';
import { isClientRuntime } from '@/src/utils/runtime';

import { searchSets } from './api';

export function useSearchSets(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const { isMockMode } = useMockMode();
  const clientRuntime = isClientRuntime();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const result = useQuery({
    queryKey: ['search', debouncedQuery, isMockMode],
    queryFn: () => searchSets(debouncedQuery, isMockMode),
    enabled: clientRuntime && debouncedQuery.length > 0,
    placeholderData: (previousData) => previousData,
  });

  return {
    ...result,
    debouncedQuery,
  };
}
