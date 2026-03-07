import { useEffect, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Sparkles } from 'lucide-react-native';

import { AppSearchInput } from '@/src/components/ui/AppSearchInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { SetCard } from '@/src/features/sets/components/SetCard';
import { useSearchSets } from '@/src/features/search/hooks';
import { trackSearchPerformed } from '@/src/lib/analytics/events';
import { theme } from '@/src/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const search = useSearchSets(query);
  const items = (search.data ?? []).map((set) => ({
    ...set,
    bestPriceByCountry: {},
  }));
  const lastTrackedKey = useRef<string | null>(null);
  const insets = useSafeAreaInsets();

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
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerClassName="gap-4 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 24 }}
      data={items}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews
      maxToRenderPerBatch={8}
      windowSize={5}
      renderItem={({ item }) => (
        <SetCard item={item} onPress={() => router.push(`/set/${item.set_num}`)} />
      )}
      ListHeaderComponent={
        <View className="gap-6">
          <View className="gap-2">
            <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
              Search
            </Text>
            <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">
              Find any LEGO set
            </Text>
            <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
              Search for a LEGO set by name or number.
            </Text>
          </View>

          <AppSearchInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search sets, themes, or SKU…"
            autoFocus={false}
          />

          {query.trim().length > 0 ? (
            <View className="flex-row items-center gap-2">
              <Sparkles color={theme.colors.primary[500]} size={18} strokeWidth={2} />
              <Text className="font-sans-bold text-xl text-neutral-900 dark:text-white">
                Results
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Search color={theme.colors.neutral[500]} size={18} strokeWidth={2} />
              <Text className="font-sans-medium text-sm text-neutral-600 dark:text-neutral-300">
                Search stays anonymous until you choose to sign in.
              </Text>
            </View>
          )}
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
