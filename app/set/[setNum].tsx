import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, TrendingDown, TrendingUp } from 'lucide-react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import { OfferRow } from '@/src/features/sets/components/OfferRow';
import { PriceHistoryChart } from '@/src/features/sets/components/PriceHistoryChart';
import { useSetDetail } from '@/src/features/sets/hooks';
import { useAuth } from '@/src/features/auth/hooks';
import { UpgradePrompt } from '@/src/features/premium/components/UpgradePrompt';
import { useEntitlements } from '@/src/features/premium/hooks';
import { usePreferences } from '@/src/hooks/usePreferences';
import { theme } from '@/src/theme';
import { trackSetViewed } from '@/src/lib/analytics/events';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function SetDetailScreen() {
  const { setNum: rawSetNum } = useLocalSearchParams<{ setNum: string }>();
  const setNum = getParam(rawSetNum);
  const { preferences } = usePreferences();
  const { user } = useAuth();
  const { entitlements } = useEntitlements();
  const [historyDays, setHistoryDays] = useState<30 | 90 | 365>(entitlements.historyDays);
  const trackedSetRef = useRef<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (historyDays > entitlements.historyDays) {
      setHistoryDays(entitlements.historyDays);
    }
  }, [entitlements.historyDays, historyDays]);

  const query = useSetDetail(setNum, {
    country: preferences.country,
    historyDays,
    userId: user?.id,
  });

  useEffect(() => {
    const trackedSetNum = query.data?.set.set_num;

    if (!trackedSetNum || trackedSetRef.current === trackedSetNum) {
      return;
    }

    trackedSetRef.current = trackedSetNum;
    trackSetViewed(trackedSetNum);
  }, [query.data?.set.set_num]);

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
        <ErrorState description="PriBrix could not load this set right now." onRetry={() => query.refetch()} />
      </View>
    );
  }

  if (!query.data) {
    return (
      <View
        className="flex-1 bg-neutral-100 px-4 dark:bg-neutral-900"
        style={{ paddingTop: insets.top + 24 }}
      >
        <EmptyState title="Set not found" description={`No catalog entry exists for ${setNum}.`} />
      </View>
    );
  }

  const { set, offers, bestPriceByCountry, priceHistory } = query.data;
  const currentPrice =
    preferences.showDeliveredPrice
      ? bestPriceByCountry[preferences.country]?.bestDeliveredPrice ??
        bestPriceByCountry[preferences.country]?.bestBasePrice ??
        set.msrp_eur
      : bestPriceByCountry[preferences.country]?.bestBasePrice ?? set.msrp_eur;
  const comparisonPrice =
    priceHistory[0] == null
      ? null
      : preferences.showDeliveredPrice
        ? priceHistory[0].min_delivered_price ?? priceHistory[0].min_base_price
        : priceHistory[0].min_base_price;
  const deltaPercent =
    currentPrice != null && comparisonPrice != null && comparisonPrice > 0
      ? ((currentPrice - comparisonPrice) / comparisonPrice) * 100
      : null;
  const deltaIsDrop = deltaPercent != null && deltaPercent < 0;
  const sortedOffers = [...offers].sort((left, right) => {
    const leftPrice = preferences.showDeliveredPrice ? left.delivered_price : left.price;
    const rightPrice = preferences.showDeliveredPrice ? right.delivered_price : right.price;

    return (leftPrice ?? Number.MAX_SAFE_INTEGER) - (rightPrice ?? Number.MAX_SAFE_INTEGER);
  });
  const bestOfferId = sortedOffers.find((offer) =>
    preferences.showDeliveredPrice ? offer.delivered_price != null : offer.price != null,
  )?.offer_id;

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerClassName="gap-6 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 24 }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-neutral-800"
          onPress={() => router.back()}
        >
          <ChevronLeft color={theme.colors.neutral[700]} size={20} strokeWidth={2} />
        </Pressable>
        <Badge label={set.theme} variant="premium" />
        <Pressable className="h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-neutral-800">
          <Share2 color={theme.colors.primary[500]} size={18} strokeWidth={2} />
        </Pressable>
      </View>

      <View className="gap-5 rounded-xl bg-white p-5 shadow-md dark:bg-neutral-800">
        {set.image_url ? (
          <Image source={{ uri: set.image_url }} className="h-72 w-full rounded-xl bg-neutral-100" resizeMode="contain" />
        ) : (
          <View className="h-72 w-full rounded-xl bg-neutral-100 dark:bg-neutral-700" />
        )}
        <View className="gap-2">
          <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
            {set.theme} · {set.year}
          </Text>
          <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">{set.name}</Text>
          <Text className="font-mono text-sm text-neutral-500">{set.set_num}</Text>
        </View>
      </View>

      <View className="gap-4 rounded-xl bg-white p-5 shadow-md dark:bg-neutral-800">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
          {preferences.country} {preferences.showDeliveredPrice ? 'delivered' : 'base'} price
        </Text>
        <PriceDisplay hero price={currentPrice} />
        <View className="flex-row items-center gap-2">
          {deltaPercent == null ? (
            <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
              Live offer pricing from the current PriBrix cache.
            </Text>
          ) : deltaIsDrop ? (
            <>
              <TrendingDown color={theme.colors.success.DEFAULT} size={18} strokeWidth={2} />
              <Text className="font-sans-semibold text-base text-success">
                ↓ {Math.abs(deltaPercent).toFixed(1)}% since the start of this {historyDays}d view
              </Text>
            </>
          ) : (
            <>
              <TrendingUp color={theme.colors.primary[500]} size={18} strokeWidth={2} />
              <Text className="font-sans-semibold text-base text-primary-500">
                ↑ {Math.abs(deltaPercent).toFixed(1)}% since the start of this {historyDays}d view
              </Text>
            </>
          )}
        </View>
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
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
          Showing {preferences.showDeliveredPrice ? 'delivered prices' : 'base prices'} in offers below.
        </Text>
      </View>

      <View className="gap-3">
        <Text className="font-sans-bold text-2xl text-neutral-900 dark:text-white">Quick actions</Text>
        <View className="flex-row flex-wrap gap-2">
          <AppButton
            onPress={() => router.push({ pathname: '/modal/add-to-list', params: { setNum, mode: 'watchlist' } })}
          >
            Add to Watchlist
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={() => router.push({ pathname: '/modal/add-to-list', params: { setNum, mode: 'wishlist' } })}
          >
            Add to Wishlist
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={() => router.push({ pathname: '/modal/add-to-list', params: { setNum, mode: 'owned' } })}
          >
            Add to Collection
          </AppButton>
        </View>
      </View>

      <PriceHistoryChart
        data={priceHistory}
        selectedHistoryDays={historyDays}
        onSelectHistoryDays={setHistoryDays}
        maxHistoryDays={entitlements.historyDays}
        onSelectLockedHistoryDays={() =>
          router.push({ pathname: '/modal/paywall', params: { reason: 'history_locked' } })
        }
        isLoading={query.isFetching}
      />

      {entitlements.historyDays === 30 ? (
        <UpgradePrompt
          title="Premium history"
          description="Upgrade to unlock 90-day and 365-day price history on every set."
          reason="history_upgrade"
        />
      ) : null}

      <View className="gap-3">
        <Text className="font-sans-bold text-2xl text-neutral-900 dark:text-white">Top retailer deals</Text>
        {offers.length === 0 ? (
          <EmptyState
            title="No offers available yet"
            description="Price ingestion has not populated retailer offers for this set yet."
          />
        ) : (
          sortedOffers.map((offer) => (
            <OfferRow
              key={offer.offer_id}
              offer={offer}
              setNum={set.set_num}
              showDeliveredPrice={preferences.showDeliveredPrice}
              isBestPrice={offer.offer_id === bestOfferId}
            />
          ))
        )}
      </View>

      <View className="rounded-xl border border-primary-100 bg-primary-50 p-6">
        <Text className="font-sans-bold text-xl text-neutral-900">Never miss a price drop</Text>
        <Text className="mt-2 font-sans text-base text-neutral-600">
          Add this set to your watchlist and PriBrix will notify you when it crosses your target price.
        </Text>
        <View className="mt-5">
          <AppButton
            fullWidth
            onPress={() =>
              router.push({ pathname: '/modal/add-to-list', params: { setNum: set.set_num, mode: 'watchlist' } })
            }
          >
            Set price alert
          </AppButton>
        </View>
      </View>
    </ScrollView>
  );
}
