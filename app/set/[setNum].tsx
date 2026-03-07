import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import { OfferRow } from '@/src/features/sets/components/OfferRow';
import { PriceHistoryChart } from '@/src/features/sets/components/PriceHistoryChart';
import { useSetDetail } from '@/src/features/sets/hooks';
import { usePreferences } from '@/src/hooks/usePreferences';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function SetDetailScreen() {
  const { setNum: rawSetNum } = useLocalSearchParams<{ setNum: string }>();
  const setNum = getParam(rawSetNum);
  const { preferences } = usePreferences();
  const [historyDays, setHistoryDays] = useState<30 | 90 | 365>(90);
  const query = useSetDetail(setNum, {
    country: preferences.country,
    historyDays,
  });

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
        <ErrorState description="PriBrix could not load this set right now." onRetry={() => query.refetch()} />
      </View>
    );
  }

  if (!query.data) {
    return (
      <View className="flex-1 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
        <EmptyState title="Set not found" description={`No catalog entry exists for ${setNum}.`} />
      </View>
    );
  }

  const { set, offers, bestPriceByCountry, priceHistory } = query.data;

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="flex-row items-center justify-between">
        <Pressable className="rounded-lg bg-white px-4 py-2 dark:bg-neutral-800" onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Back</Text>
        </Pressable>
        <Badge label={set.theme} variant="premium" />
      </View>

      <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        {set.image_url ? (
          <Image source={{ uri: set.image_url }} className="h-64 w-full rounded-xl bg-neutral-100" resizeMode="contain" />
        ) : (
          <View className="h-64 w-full rounded-xl bg-neutral-100 dark:bg-neutral-700" />
        )}
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">{set.name}</Text>
          <Text className="text-sm text-neutral-400">{set.set_num}</Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            {set.theme} · {set.year}
          </Text>
        </View>
      </View>

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">Best price</Text>
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[140px] gap-2 rounded-lg bg-primary-50 p-3">
            <Badge label="BE" variant="country" />
            <PriceDisplay
              price={
                preferences.showDeliveredPrice
                  ? bestPriceByCountry.BE?.bestDeliveredPrice ?? null
                  : bestPriceByCountry.BE?.bestBasePrice ?? null
              }
              label={preferences.showDeliveredPrice ? 'Delivered' : 'Base'}
              compact
            />
          </View>
          <View className="min-w-[140px] gap-2 rounded-lg bg-accent-50 p-3">
            <Badge label="NL" variant="country" />
            <PriceDisplay
              price={
                preferences.showDeliveredPrice
                  ? bestPriceByCountry.NL?.bestDeliveredPrice ?? null
                  : bestPriceByCountry.NL?.bestBasePrice ?? null
              }
              label={preferences.showDeliveredPrice ? 'Delivered' : 'Base'}
              compact
            />
          </View>
        </View>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          Showing {preferences.showDeliveredPrice ? 'delivered prices' : 'base prices'} in offers below.
        </Text>
      </View>

      <View className="gap-3">
        <Text className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">List actions</Text>
        <View className="flex-row flex-wrap gap-2">
          <Pressable
            className="rounded-lg bg-primary-600 px-4 py-3"
            onPress={() => router.push({ pathname: '/modal/add-to-list', params: { setNum, mode: 'watchlist' } })}
          >
            <Text className="text-sm font-semibold text-white">Add to Watchlist</Text>
          </Pressable>
          <Pressable
            className="rounded-lg bg-neutral-100 px-4 py-3 dark:bg-neutral-800"
            onPress={() => router.push({ pathname: '/modal/add-to-list', params: { setNum, mode: 'wishlist' } })}
          >
            <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Add to Wishlist</Text>
          </Pressable>
          <Pressable
            className="rounded-lg bg-neutral-100 px-4 py-3 dark:bg-neutral-800"
            onPress={() => router.push({ pathname: '/modal/add-to-list', params: { setNum, mode: 'owned' } })}
          >
            <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Add to Collection</Text>
          </Pressable>
        </View>
      </View>

      <PriceHistoryChart
        data={priceHistory}
        selectedHistoryDays={historyDays}
        onSelectHistoryDays={setHistoryDays}
        isLoading={query.isFetching}
      />

      <View className="gap-3">
        <Text className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">Offers</Text>
        {offers.length === 0 ? (
          <EmptyState
            title="No offers available yet"
            description="Price ingestion has not populated retailer offers for this set yet."
          />
        ) : (
          offers.map((offer) => (
            <OfferRow
              key={offer.offer_id}
              offer={offer}
              setNum={set.set_num}
              showDeliveredPrice={preferences.showDeliveredPrice}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
