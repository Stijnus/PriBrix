import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { usePreferences } from '@/src/hooks/usePreferences';
import { SetCard } from '@/src/features/sets/components/SetCard';
import { useBestPricesDaily } from '@/src/features/sets/hooks';
import type { SetSort } from '@/src/features/sets/types';

const sortOptions: { label: string; value: SetSort }[] = [
  { label: 'Lowest price', value: 'lowest-price' },
  { label: 'Newest', value: 'newest' },
  { label: 'Theme', value: 'theme' },
];

export default function HomeScreen() {
  const [sort, setSort] = useState<SetSort>('lowest-price');
  const { preferences } = usePreferences();
  const query = useBestPricesDaily(preferences.country, sort);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  if (query.isLoading) {
    return (
      <View className="flex-1 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
        <LoadingSkeleton count={4} />
      </View>
    );
  }

  if (query.isError) {
    return (
      <View className="flex-1 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
        <ErrorState
          description="PriBrix could not load the browse catalog right now."
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerClassName="gap-4 px-4 py-6"
      data={items}
      keyExtractor={(item) => item.id}
      onRefresh={() => query.refetch()}
      refreshing={query.isRefetching}
      renderItem={({ item }) => (
        <SetCard item={item} onPress={() => router.push(`/set/${item.set_num}`)} />
      )}
      ListHeaderComponent={
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Browse</Text>
            <Text className="text-3xl font-bold text-neutral-700 dark:text-neutral-100">
              Best LEGO prices in {preferences.country}
            </Text>
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              Anonymous users can browse, search, and manage local lists before sign-in.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {sortOptions.map((option) => (
              <Pressable
                key={option.value}
                className={`rounded-full px-3 py-1.5 ${
                  sort === option.value
                    ? 'bg-primary-100'
                    : 'bg-white dark:bg-neutral-800'
                }`}
                onPress={() => setSort(option.value)}
              >
                <Text
                  className={`text-sm font-medium ${
                    sort === option.value
                      ? 'text-primary-700'
                      : 'text-neutral-500 dark:text-neutral-300'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title="No prices available yet"
          description="Catalog data is present, but price ingestion has not populated the browse cache yet."
        />
      }
      ListFooterComponent={
        query.hasNextPage ? (
          <Pressable
            className="mt-2 rounded-lg bg-neutral-100 px-5 py-3 dark:bg-neutral-800"
            onPress={() => query.fetchNextPage()}
          >
            <Text className="text-center text-base font-semibold text-neutral-700 dark:text-neutral-100">
              {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </Text>
          </Pressable>
        ) : null
      }
    />
  );
}
