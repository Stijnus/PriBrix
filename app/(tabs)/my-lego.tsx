import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Boxes, Heart, Wallet } from 'lucide-react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppChip } from '@/src/components/ui/AppChip';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import { StatCard } from '@/src/components/ui/StatCard';
import { OwnedList } from '@/src/features/owned/components/OwnedList';
import { useOwned } from '@/src/features/owned/hooks';
import { useAuth } from '@/src/features/auth/hooks';
import { UpgradePrompt } from '@/src/features/premium/components/UpgradePrompt';
import { useEntitlements } from '@/src/features/premium/hooks';
import { CollectionSetCard } from '@/src/features/sets/components/CollectionSetCard';
import { fetchSetDetail } from '@/src/features/sets/api';
import { useSetsWithBestPrices } from '@/src/features/sets/hooks';
import { WatchlistList } from '@/src/features/watchlist/components/WatchlistList';
import { useWatchlist } from '@/src/features/watchlist/hooks';
import { WishlistList } from '@/src/features/wishlist/components/WishlistList';
import { useWishlist } from '@/src/features/wishlist/hooks';
import { usePreferences } from '@/src/hooks/usePreferences';
import { useMockMode } from '@/src/hooks/useMockMode';
import { theme } from '@/src/theme';
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

  const ownedSets = useSetsWithBestPrices(owned.items.map((item) => item.set_num), clientRuntime);
  const wishlistSets = useSetsWithBestPrices(wishlist.items.map((item) => item.set_num), clientRuntime);

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

  const totalOwnedUnits = useMemo(
    () => owned.items.reduce((total, item) => total + (item.quantity ?? 1), 0),
    [owned.items],
  );

  const collectionValue = useMemo(() => {
    const setMap = new Map(ownedSets.data.map((set) => [set.set_num, set]));

    return owned.items.reduce((total, item) => {
      const set = setMap.get(item.set_num);
      const quantity = item.quantity ?? 1;
      const price =
        preferences.showDeliveredPrice
          ? set?.bestPriceByCountry[preferences.country]?.bestDeliveredPrice ??
            set?.bestPriceByCountry[preferences.country]?.bestBasePrice ??
            set?.msrp_eur ??
            0
          : set?.bestPriceByCountry[preferences.country]?.bestBasePrice ?? set?.msrp_eur ?? 0;

      return total + price * quantity;
    }, 0);
  }, [owned.items, ownedSets.data, preferences.country, preferences.showDeliveredPrice]);

  const insets = useSafeAreaInsets();
  const featuredSet = ownedSets.data[0] ?? wishlistSets.data[0] ?? null;
  const featuredPrice =
    featuredSet == null
      ? null
      : preferences.showDeliveredPrice
        ? featuredSet.bestPriceByCountry[preferences.country]?.bestDeliveredPrice ??
          featuredSet.bestPriceByCountry[preferences.country]?.bestBasePrice ??
          featuredSet.msrp_eur
        : featuredSet.bestPriceByCountry[preferences.country]?.bestBasePrice ?? featuredSet.msrp_eur;
  const previewSets =
    activeTab === 'wishlist'
      ? wishlistSets.data.slice(0, 2)
      : activeTab === 'owned'
        ? ownedSets.data.slice(0, 2)
        : [];

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
    <ScrollView
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerClassName="gap-6 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 24 }}
    >
      <View className="gap-2">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
          My LEGO
        </Text>
        <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">
          Your PriBrix dashboard
        </Text>
        <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
          {user
            ? 'Your lists are synced to your PriBrix account.'
            : 'Anonymous users keep their collection, wishlist, and watchlist locally until sign-in.'}
        </Text>
      </View>

      <View className="gap-4">
        <View className="flex-row gap-4">
          <StatCard
            label="Owned sets"
            value={String(owned.items.length)}
            detail={`${totalOwnedUnits} total units tracked`}
          />
          <StatCard
            label="Collection value"
            value={new Intl.NumberFormat('nl-BE', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(collectionValue)}
            detail={`${preferences.country} ${preferences.showDeliveredPrice ? 'delivered' : 'base'} pricing`}
          />
        </View>
        <StatCard
          label="Watching"
          value={String(watchlist.items.length)}
          detail={
            user ? 'Price alerts stay synced across devices.' : 'Local watchlist works before sign-in.'
          }
        />
      </View>

      {featuredSet ? (
        <View className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-neutral-800">
          <Pressable
            onPress={() => router.push(`/set/${featuredSet.set_num}`)}
            style={({ pressed }) => (pressed ? { transform: [{ scale: 0.99 }] } : undefined)}
          >
            <View className="h-64 w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
              {featuredSet.image_url ? (
                <Image source={{ uri: featuredSet.image_url }} className="h-full w-full" resizeMode="contain" />
              ) : (
                <View className="h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900" />
              )}
            </View>
          </Pressable>
          <View className="gap-3 p-5">
            <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
              {ownedSets.data.length > 0 ? 'Featured from your collection' : 'Saved from your wishlist'}
            </Text>
            <Text className="font-sans-bold text-xl text-neutral-900 dark:text-white">
              {featuredSet.name}
            </Text>
            <PriceDisplay compact price={featuredPrice} />
            <View className="flex-row gap-3">
              <AppButton onPress={() => router.push(`/set/${featuredSet.set_num}`)}>
                Open set
              </AppButton>
              <AppButton
                variant="secondary"
                onPress={() =>
                  router.push({ pathname: '/modal/add-to-list', params: { setNum: featuredSet.set_num, mode: 'watchlist' } })
                }
              >
                Set alert
              </AppButton>
            </View>
          </View>
        </View>
      ) : (
        <View className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <Text className="font-sans-bold text-xl text-neutral-900 dark:text-white">
            Start building your PriBrix dashboard
          </Text>
          <Text className="mt-2 font-sans text-base text-neutral-600 dark:text-neutral-300">
            Add a set from search or set detail and it will appear here with live pricing context.
          </Text>
        </View>
      )}

      {user ? (
        <View className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
            Sync status
          </Text>
          <Text className="mt-2 font-sans text-base text-neutral-600 dark:text-neutral-300">
            {isMigrating
              ? 'Syncing local lists to your account…'
              : `Server-backed lists active for ${user.email ?? 'your account'}.`}
          </Text>
        </View>
      ) : (
        <View className="rounded-xl border border-primary-100 bg-primary-50 p-5">
          <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
            Sign in to sync
          </Text>
          <Text className="mt-2 font-sans text-base text-neutral-600">
            Save your watchlist, wishlist, and collection across devices and prepare alerts.
          </Text>
          <View className="mt-4">
            <AppButton fullWidth onPress={() => router.push('/auth/sign-in')}>
              Sign in to sync lists
            </AppButton>
          </View>
        </View>
      )}

      {previewSets.length > 0 ? (
        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            {activeTab === 'wishlist' ? (
              <Heart size={18} strokeWidth={2} color={theme.colors.primary[500]} />
            ) : (
              <Boxes size={18} strokeWidth={2} color={theme.colors.primary[500]} />
            )}
            <Text className="font-sans-bold text-2xl text-neutral-900 dark:text-white">
              {activeTab === 'wishlist' ? 'Saved set preview' : 'Collection preview'}
            </Text>
          </View>
          <View className="flex-row gap-4">
            {previewSets.map((item) => (
              <CollectionSetCard
                key={item.id}
                country={preferences.country}
                item={item}
                onPress={() => router.push(`/set/${item.set_num}`)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View className="flex-row flex-wrap gap-3">
        {tabs.map((tab) => (
          <AppChip
            key={tab.value}
            label={tab.label}
            active={activeTab === tab.value}
            onPress={() => setActiveTab(tab.value)}
          />
        ))}
      </View>

      {selectedContent}

      {activeTab === 'watching' ? (
        <View className="gap-3">
          <View className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
            <View className="flex-row items-center gap-2">
              <Bell size={18} color={theme.colors.primary[500]} strokeWidth={2} />
              <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">
                Watchlist usage
              </Text>
            </View>
            <Text className="mt-2 font-sans text-base text-neutral-600 dark:text-neutral-300">
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

      {activeTab === 'owned' ? (
        <View className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <View className="flex-row items-center gap-2">
            <Wallet size={18} color={theme.colors.primary[500]} strokeWidth={2} />
            <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">
              Collection value notes
            </Text>
          </View>
          <Text className="mt-2 font-sans text-base text-neutral-600 dark:text-neutral-300">
            Value uses the latest PriBrix offer cache for your preferred country and falls back to MSRP where needed.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
