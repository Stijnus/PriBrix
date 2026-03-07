import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { useAuth } from '@/src/features/auth/hooks';
import { useOwned } from '@/src/features/owned/hooks';
import { useSetSummary } from '@/src/features/sets/hooks';
import { useWatchlist } from '@/src/features/watchlist/hooks';
import { useWishlist } from '@/src/features/wishlist/hooks';
import { usePreferences } from '@/src/hooks/usePreferences';
import { colors } from '@/src/theme/colors';

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
      <View className="flex-1 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
        <LoadingSkeleton count={2} compact />
      </View>
    );
  }

  if (summary.isError || !summary.data) {
    return (
      <View className="flex-1 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
        <ErrorState description="PriBrix could not load this set for list actions." />
      </View>
    );
  }

  const setSummary = summary.data;

  async function handleSave() {
    if (mode === 'watchlist') {
      await watchlist.addItem({
        set_num: setNum,
        country,
        target_base_price: targetPrice ? Number(targetPrice.replace(',', '.')) : undefined,
      });
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

    Alert.alert(
      'Saved',
      `${setSummary.name} was added to your ${watchlist.mode === 'server' || wishlist.mode === 'server' || owned.mode === 'server' ? 'synced' : 'local'} ${mode}.`,
    );
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Add to list</Text>
        <Pressable className="rounded-lg bg-white px-4 py-2 dark:bg-neutral-800" onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Close</Text>
        </Pressable>
      </View>

      <View className="gap-1 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">{setSummary.name}</Text>
        <Text className="text-sm text-neutral-400">{setSummary.set_num}</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {modes.map((entryMode) => (
          <Text
            key={entryMode}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              mode === entryMode
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
            onPress={() => setMode(entryMode)}
          >
            {entryMode === 'owned'
              ? 'Collection'
              : entryMode.charAt(0).toUpperCase() + entryMode.slice(1)}
          </Text>
        ))}
      </View>

      {mode === 'watchlist' ? (
        <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">Watch settings</Text>
          {!user ? (
            <Pressable className="rounded-lg bg-primary-50 p-3" onPress={() => router.push('/auth/sign-in')}>
              <Text className="text-sm font-semibold text-primary-600">Create an account to enable synced alerts</Text>
              <Text className="mt-1 text-sm text-neutral-600">
                You can save this watch locally now, then sign in to sync it across devices.
              </Text>
            </Pressable>
          ) : null}
          <View className="flex-row gap-2">
            {(['BE', 'NL', '*'] as const).map((value) => (
              <Text
                key={value}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  country === value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300'
                }`}
                onPress={() => setCountry(value)}
              >
                {value}
              </Text>
            ))}
          </View>
          <TextInput
            value={targetPrice}
            onChangeText={setTargetPrice}
            keyboardType="numeric"
            placeholder="Target base price (optional)"
            placeholderTextColor={colors.neutral[400]}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </View>
      ) : null}

      {mode === 'wishlist' ? (
        <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">Wishlist settings</Text>
          <View className="flex-row gap-2">
            {priorities.map((value) => (
              <Text
                key={value}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  priority === value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300'
                }`}
                onPress={() => setPriority(value)}
              >
                {value}
              </Text>
            ))}
          </View>
          <TextInput
            value={targetPrice}
            onChangeText={setTargetPrice}
            keyboardType="numeric"
            placeholder="Target base price (optional)"
            placeholderTextColor={colors.neutral[400]}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </View>
      ) : null}

      {mode === 'owned' ? (
        <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">Collection settings</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            placeholder="Quantity"
            placeholderTextColor={colors.neutral[400]}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <View className="flex-row gap-2">
            {conditions.map((value) => (
              <Text
                key={value}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  condition === value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300'
                }`}
                onPress={() => setCondition(value)}
              >
                {value}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable className="items-center rounded-lg bg-primary-600 px-5 py-3" onPress={() => void handleSave()}>
        <Text className="text-base font-semibold text-white">{user ? 'Save to account' : 'Save locally'}</Text>
      </Pressable>
    </ScrollView>
  );
}
