import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { OwnedList } from '@/src/features/owned/components/OwnedList';
import { useOwned } from '@/src/features/owned/hooks';
import { useAuth } from '@/src/features/auth/hooks';
import { UpgradePrompt } from '@/src/features/premium/components/UpgradePrompt';
import { useEntitlements } from '@/src/features/premium/hooks';
import { fetchSetDetail, fetchSetsBySetNums } from '@/src/features/sets/api';
import { WatchlistList } from '@/src/features/watchlist/components/WatchlistList';
import { useWatchlist } from '@/src/features/watchlist/hooks';
import { WishlistList } from '@/src/features/wishlist/components/WishlistList';
import { useWishlist } from '@/src/features/wishlist/hooks';
import { usePreferences } from '@/src/hooks/usePreferences';
import { useMockMode } from '@/src/hooks/useMockMode';
import { isClientRuntime } from '@/src/utils/runtime';

const tabs = [
  { label: 'Owned', value: 'owned' },
  { label: 'Wishlist', value: 'wishlist' },
  { label: 'Watching', value: 'watching' },
] as const;

export default function MyLegoScreen() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['value']>('owned');
  const { preferences } = usePreferences();
  const { isMockMode } = useMockMode();
  const { entitlements, data: plan } = useEntitlements();
  const { user, isMigrating } = useAuth();
  const owned = useOwned();
  const wishlist = useWishlist();
  const watchlist = useWatchlist();
  const clientRuntime = isClientRuntime();

  const ownedSets = useQuery({
    queryKey: ['owned-sets', owned.mode, owned.items.map((item) => item.set_num).join(',')],
    queryFn: () => fetchSetsBySetNums(owned.items.map((item) => item.set_num), isMockMode),
    enabled: clientRuntime && owned.items.length > 0,
    initialData: [],
  });

  const wishlistSets = useQuery({
    queryKey: ['wishlist-sets', wishlist.mode, wishlist.items.map((item) => item.set_num).join(',')],
    queryFn: () => fetchSetsBySetNums(wishlist.items.map((item) => item.set_num), isMockMode),
    enabled: clientRuntime && wishlist.items.length > 0,
    initialData: [],
  });

  const watchlistDetails = useQuery({
    queryKey: ['watchlist-details', watchlist.mode, watchlist.items.map((item) => `${item.set_num}-${item.country ?? '*'}`).join(',')],
    queryFn: async () => {
      const details = await Promise.all(
        watchlist.items.map((item) =>
          fetchSetDetail(
            item.set_num,
            {
              country: item.country ?? '*',
              historyDays: 30,
            },
            isMockMode,
          ),
        ),
      );
      return details;
    },
    enabled: clientRuntime && watchlist.items.length > 0,
    initialData: [],
  });

  const ownedEntries = useMemo(() => {
    const setMap = new Map(ownedSets.data.map((set) => [set.set_num, set]));
    return owned.items.map((item) => ({
      ...item,
      set: setMap.get(item.set_num) ?? null,
    }));
  }, [owned.items, ownedSets.data]);

  const wishlistEntries = useMemo(() => {
    const setMap = new Map(wishlistSets.data.map((set) => [set.set_num, set]));
    return wishlist.items.map((item) => ({
      ...item,
      set: setMap.get(item.set_num) ?? null,
    }));
  }, [wishlist.items, wishlistSets.data]);

  const watchlistEntries = useMemo(() => {
    const detailMap = new Map(
      watchlistDetails.data.flatMap((detail) => (detail ? [[detail.set.set_num, detail] as const] : [])),
    );

    return watchlist.items.map((item) => {
      const detail = detailMap.get(item.set_num);
      const preferredCountry = item.country === '*' || item.country == null ? preferences.country : item.country;
      return {
        ...item,
        set: detail?.set ?? null,
        currentPrice: detail?.bestPriceByCountry[preferredCountry]?.bestBasePrice ?? null,
      };
    });
  }, [preferences.country, watchlist.items, watchlistDetails.data]);

  const selectedContent =
    activeTab === 'owned' ? (
      owned.isLoading || ownedSets.isLoading ? (
        <LoadingSkeleton count={3} compact />
      ) : (
        <OwnedList items={ownedEntries} onRemove={(setNum) => void owned.removeItem(setNum)} />
      )
    ) : activeTab === 'wishlist' ? (
      wishlist.isLoading || wishlistSets.isLoading ? (
        <LoadingSkeleton count={3} compact />
      ) : (
        <WishlistList items={wishlistEntries} onRemove={(setNum) => void wishlist.removeItem(setNum)} />
      )
    ) : watchlist.isLoading || watchlistDetails.isLoading ? (
      <LoadingSkeleton count={3} compact />
    ) : (
      <WatchlistList
        items={watchlistEntries}
        isSignedIn={Boolean(user)}
        onRemove={(item) => void watchlist.removeItem(item)}
      />
    );

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="gap-2">
        <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">My LEGO</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          {user
            ? 'Your lists are synced to your PriBrix account.'
            : 'Anonymous users keep their collection, wishlist, and watchlist locally until sign-in.'}
        </Text>
      </View>

      {user ? (
        <View className="rounded-xl bg-accent-50 p-4 dark:bg-neutral-800">
          <Text className="text-sm font-semibold uppercase tracking-wide text-accent-700">Sync status</Text>
          <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            {isMigrating ? 'Syncing local lists to your account…' : `Server-backed lists active for ${user.email ?? 'your account'}.`}
          </Text>
        </View>
      ) : (
        <Pressable className="rounded-xl bg-primary-50 p-4" onPress={() => router.push('/auth/sign-in')}>
          <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Sign in to sync</Text>
          <Text className="mt-1 text-sm text-neutral-600">
            Save your watchlist, wishlist, and collection across devices and prepare alerts.
          </Text>
        </Pressable>
      )}

      <View className="flex-row gap-2">
        {tabs.map((tab) => (
          <Text
            key={tab.value}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeTab === tab.value
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
            onPress={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      {selectedContent}

      {activeTab === 'watching' ? (
        <View className="gap-3">
          <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Watchlist usage</Text>
            <Text className="mt-1 text-base text-neutral-600 dark:text-neutral-300">
              {entitlements.watchlistLimit == null
                ? `${watchlist.items.length} watch slots used · Unlimited on Premium`
                : `${watchlist.items.length} / ${entitlements.watchlistLimit} watch slots used`}
            </Text>
          </View>
          {entitlements.watchlistLimit != null ? (
            <UpgradePrompt
              title={plan?.isExpired ? 'Premium expired' : 'Need more watch slots?'}
              description="Premium removes the 20-item watchlist cap and unlocks advanced alerts."
              reason="watchlist_usage"
            />
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}
