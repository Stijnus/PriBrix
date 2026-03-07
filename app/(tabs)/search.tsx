import { useEffect, useRef, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { SetCard } from '@/src/features/sets/components/SetCard';
import { useSearchSets } from '@/src/features/search/hooks';
import { trackSearchPerformed } from '@/src/lib/analytics/events';
import { colors } from '@/src/theme/colors';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const search = useSearchSets(query);
  const items = (search.data ?? []).map((set) => ({
    ...set,
    bestPriceByCountry: {},
  }));
  const lastTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (search.debouncedQuery.length === 0 || search.isLoading || search.isError) {
      return;
    }

    const trackingKey = `${search.debouncedQuery}:${items.length}`;

    if (lastTrackedKey.current === trackingKey) {
      return;
    }

    lastTrackedKey.current = trackingKey;
    trackSearchPerformed(search.debouncedQuery, items.length);
  }, [items.length, search.debouncedQuery, search.isError, search.isLoading]);

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerClassName="gap-4 px-4 py-6"
      data={items}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <SetCard item={item} onPress={() => router.push(`/set/${item.set_num}`)} />
      )}
      ListHeaderComponent={
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Search</Text>
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              Search for a LEGO set by name or number.
            </Text>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a LEGO set by name or number"
            placeholderTextColor={colors.neutral[400]}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </View>
      }
      ListEmptyComponent={
        query.trim().length === 0 ? (
          <EmptyState
            title="Search for a LEGO set"
            description="Type a set number like 75192-1 or part of a name to search the catalog."
          />
        ) : search.isLoading ? (
          <LoadingSkeleton count={4} compact />
        ) : search.isError ? (
          <ErrorState
            description="PriBrix could not search the catalog right now."
            onRetry={() => search.refetch()}
          />
        ) : (
          <EmptyState
            title="No sets found"
            description={`No sets found for "${search.debouncedQuery}".`}
          />
        )
      }
    />
  );
}
