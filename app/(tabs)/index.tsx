import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListFilter, Sparkles } from 'lucide-react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppChip } from '@/src/components/ui/AppChip';
import { AppSearchInput } from '@/src/components/ui/AppSearchInput';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { usePreferences } from '@/src/hooks/usePreferences';
import { SetCard } from '@/src/features/sets/components/SetCard';
import { useBestPricesDaily } from '@/src/features/sets/hooks';
import { theme } from '@/src/theme';
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
  const insets = useSafeAreaInsets();

  if (query.isLoading) {
    return (
      <View
        className="flex-1 bg-neutral-100 px-4 dark:bg-neutral-900"
        style={{ paddingTop: insets.top + 24 }}
      >
        <LoadingSkeleton count={4} />
      </View>
    );
  }

  if (query.isError) {
    return (
      <View
        className="flex-1 bg-neutral-100 px-4 dark:bg-neutral-900"
        style={{ paddingTop: insets.top + 24 }}
      >
        <ErrorState
          description="PriBrix could not load the browse catalog right now."
          onRetry={() => query.refetch()}
        />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerClassName="gap-4 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 24 }}
      data={items}
      keyExtractor={(item) => item.id}
      onRefresh={() => query.refetch()}
      refreshing={query.isRefetching}
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
              Discovery
            </Text>
            <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">
              Trending deals in {preferences.country}
            </Text>
            <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
              PriBrix surfaces the best daily LEGO prices from authorized retailer feeds.
            </Text>
          </View>

          <Pressable onPress={() => router.push('/search')}>
            <View pointerEvents="none">
              <AppSearchInput editable={false} placeholder="Search sets, themes, or SKU…" />
            </View>
          </Pressable>

          <View className="flex-row flex-wrap gap-3">
            {sortOptions.map((option) => (
              <AppChip
                key={option.value}
                label={option.label}
                active={sort === option.value}
                onPress={() => setSort(option.value)}
              />
            ))}
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Sparkles color={theme.colors.primary[500]} size={18} strokeWidth={2} />
              <Text className="font-sans-bold text-xl text-neutral-900 dark:text-white">
                Deal feed
              </Text>
            </View>
            <View className="flex-row items-center gap-2 rounded-full bg-white px-3 py-2 dark:bg-neutral-800">
              <ListFilter color={theme.colors.neutral[500]} size={16} strokeWidth={2} />
              <Text className="font-sans-medium text-sm text-neutral-600 dark:text-neutral-300">
                {sortOptions.find((option) => option.value === sort)?.label}
              </Text>
            </View>
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
          <AppButton variant="ghost" size="md" fullWidth onPress={() => query.fetchNextPage()}>
            {query.isFetchingNextPage ? 'Loading…' : 'Load more deals'}
          </AppButton>
        ) : null
      }
    />
  );
}
