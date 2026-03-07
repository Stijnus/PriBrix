import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppChip } from '@/src/components/ui/AppChip';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { useAuth } from '@/src/features/auth/hooks';
import { useOwned } from '@/src/features/owned/hooks';
import { useEntitlements } from '@/src/features/premium/hooks';
import { useSetSummary } from '@/src/features/sets/hooks';
import { useWatchlist } from '@/src/features/watchlist/hooks';
import { useWishlist } from '@/src/features/wishlist/hooks';
import { usePreferences } from '@/src/hooks/usePreferences';
import { trackWatchAdded } from '@/src/lib/analytics/events';
import { colors } from '@/src/theme/colors';
import { theme } from '@/src/theme';

const modes = ['watchlist', 'wishlist', 'owned'] as const;
const conditions = ['sealed', 'used', 'incomplete'] as const;
const priorities = ['low', 'medium', 'high'] as const;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function AddToListModal() {
  const params = useLocalSearchParams<{ setNum: string; mode?: string }>();
  const setNum = getParam(params.setNum);
  const initialMode = getParam(params.mode);
  const [mode, setMode] = useState<(typeof modes)[number]>(
    modes.includes(initialMode as (typeof modes)[number]) ? (initialMode as (typeof modes)[number]) : 'watchlist',
  );
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<(typeof conditions)[number]>('sealed');
  const [priority, setPriority] = useState<(typeof priorities)[number]>('medium');
  const [country, setCountry] = useState<'BE' | 'NL' | '*'>('*');
  const [targetPrice, setTargetPrice] = useState('');
  const { preferences } = usePreferences();
  const { entitlements } = useEntitlements();
  const { user } = useAuth();
  const summary = useSetSummary(setNum);
  const owned = useOwned();
  const wishlist = useWishlist();
  const watchlist = useWatchlist();

  useEffect(() => {
    setCountry(preferences.country);
  }, [preferences.country]);

  if (summary.isLoading) {
    return (
      <View className="flex-1 bg-neutral-100 px-4 py-6 dark:bg-neutral-900">
        <LoadingSkeleton count={2} compact />
      </View>
    );
  }

  if (summary.isError || !summary.data) {
    return (
      <View className="flex-1 bg-neutral-100 px-4 py-6 dark:bg-neutral-900">
        <ErrorState description="PriBrix could not load this set for list actions." />
      </View>
    );
  }

  const setSummary = summary.data;

  async function handleSave() {
    try {
      if (mode === 'watchlist') {
        const alreadyWatching = watchlist.items.some(
          (item) => item.set_num === setNum && (item.country ?? '*') === (country ?? '*'),
        );

        if (
          entitlements.watchlistLimit != null &&
          !alreadyWatching &&
          watchlist.items.length >= entitlements.watchlistLimit
        ) {
          router.push({ pathname: '/modal/paywall', params: { reason: 'watchlist_limit' } });
          return;
        }

        await watchlist.addItem({
          set_num: setNum,
          country,
          target_base_price: targetPrice ? Number(targetPrice.replace(',', '.')) : undefined,
        });
        trackWatchAdded(setNum, country);
      } else if (mode === 'wishlist') {
        await wishlist.addItem({
          set_num: setNum,
          priority,
          target_base_price: targetPrice ? Number(targetPrice.replace(',', '.')) : undefined,
        });
      } else {
        await owned.addItem({
          set_num: setNum,
          quantity: Math.max(1, Number(quantity) || 1),
          condition,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save this list item.';

      if (
        message.toLowerCase().includes('watchlist limit') ||
        message.toLowerCase().includes('upgrade to premium')
      ) {
        router.push({ pathname: '/modal/paywall', params: { reason: 'watchlist_limit' } });
        return;
      }

      Alert.alert('Could not save', message);
      return;
    }

    Alert.alert(
      'Saved',
      `${setSummary.name} was added to your ${watchlist.mode === 'server' || wishlist.mode === 'server' || owned.mode === 'server' ? 'synced' : 'local'} ${mode}.`,
    );
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">Add to list</Text>
        <Pressable className="h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-neutral-800" onPress={() => router.back()}>
          <ChevronLeft color={theme.colors.neutral[700]} size={20} strokeWidth={2} />
        </Pressable>
      </View>

      <View className="gap-1 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">{setSummary.name}</Text>
        <Text className="font-mono text-sm text-neutral-500">{setSummary.set_num}</Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {modes.map((entryMode) => (
          <AppChip
            key={entryMode}
            label={entryMode === 'owned'
              ? 'Collection'
              : entryMode.charAt(0).toUpperCase() + entryMode.slice(1)}
            active={mode === entryMode}
            onPress={() => setMode(entryMode)}
          />
        ))}
      </View>

      {mode === 'watchlist' ? (
        <View className="gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">Watch settings</Text>
          {!user ? (
            <Pressable className="rounded-lg border border-primary-100 bg-primary-50 p-3" onPress={() => router.push('/auth/sign-in')}>
              <Text className="font-sans-semibold text-sm text-primary-500">Create an account to enable synced alerts</Text>
              <Text className="mt-1 font-sans text-sm text-neutral-600">
                You can save this watch locally now, then sign in to sync it across devices.
              </Text>
            </Pressable>
          ) : null}
          <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            {entitlements.watchlistLimit == null
              ? `${watchlist.items.length} watch slots used · Unlimited on Premium`
              : `${watchlist.items.length} / ${entitlements.watchlistLimit} watch slots used`}
          </Text>
          <View className="flex-row gap-2">
            {(['BE', 'NL', '*'] as const).map((value) => (
              <AppChip
                key={value}
                label={value}
                active={country === value}
                onPress={() => setCountry(value)}
              />
            ))}
          </View>
          <TextInput
            value={targetPrice}
            onChangeText={setTargetPrice}
            keyboardType="numeric"
            placeholder="Target base price (optional)"
            placeholderTextColor={colors.neutral[400]}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 font-mono text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </View>
      ) : null}

      {mode === 'wishlist' ? (
        <View className="gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">Wishlist settings</Text>
          <View className="flex-row gap-2">
            {priorities.map((value) => (
              <AppChip
                key={value}
                label={value}
                active={priority === value}
                onPress={() => setPriority(value)}
              />
            ))}
          </View>
          <TextInput
            value={targetPrice}
            onChangeText={setTargetPrice}
            keyboardType="numeric"
            placeholder="Target base price (optional)"
            placeholderTextColor={colors.neutral[400]}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 font-mono text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </View>
      ) : null}

      {mode === 'owned' ? (
        <View className="gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">Collection settings</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            placeholder="Quantity"
            placeholderTextColor={colors.neutral[400]}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 font-mono text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <View className="flex-row gap-2">
            {conditions.map((value) => (
              <AppChip
                key={value}
                label={value}
                active={condition === value}
                onPress={() => setCondition(value)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <AppButton fullWidth onPress={() => void handleSave()}>
        {user ? 'Save to account' : 'Save locally'}
      </AppButton>
    </ScrollView>
  );
}
