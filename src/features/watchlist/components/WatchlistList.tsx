import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import {
  useAlerts,
  useCreateAlert,
  useDeleteAlert,
  useUpdateAlert,
} from '@/src/features/alerts/hooks';
import type { Set } from '@/src/lib/validation/sets';
import { colors } from '@/src/theme/colors';
import { formatPrice } from '@/src/utils/formatPrice';

import type { WatchlistEntry } from '../hooks';

export type ResolvedWatchlistEntry = WatchlistEntry & {
  set: Set | null;
  currentPrice: number | null;
};

function WatchlistRow({
  item,
  isSignedIn,
  onRemove,
}: {
  item: ResolvedWatchlistEntry;
  isSignedIn: boolean;
  onRemove: (item: { setNum: string; country?: WatchlistEntry['country'] }) => void;
}) {
  const [isEditingAlert, setIsEditingAlert] = useState(false);
  const [thresholdInput, setThresholdInput] = useState('');
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const alerts = useAlerts(item.id, isSignedIn && Boolean(item.id));
  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();
  const baseAlert = useMemo(
    () => alerts.items.find((alert) => alert.type === 'below_base_price') ?? null,
    [alerts.items],
  );

  useEffect(() => {
    if (baseAlert?.threshold_price != null) {
      setThresholdInput(String(baseAlert.threshold_price));
    } else if (item.target_base_price != null) {
      setThresholdInput(String(item.target_base_price));
    } else {
      setThresholdInput('');
    }

    setIsAlertEnabled(baseAlert?.is_enabled ?? true);
  }, [baseAlert?.id, baseAlert?.is_enabled, baseAlert?.threshold_price, item.target_base_price]);

  async function handleSaveAlert() {
    if (!isSignedIn) {
      router.push('/auth/sign-in');
      return;
    }

    if (!item.id) {
      Alert.alert('Alert unavailable', 'This watchlist item is not synced yet.');
      return;
    }

    const normalizedInput = thresholdInput.replace(',', '.').trim();
    const thresholdPrice = Number.parseFloat(normalizedInput);

    if (!Number.isFinite(thresholdPrice) || thresholdPrice <= 0) {
      Alert.alert('Enter a valid price', 'Use a target price above zero in EUR.');
      return;
    }

    try {
      if (baseAlert) {
        await updateAlert.mutateAsync({
          alertId: baseAlert.id,
          thresholdPrice,
          isEnabled: isAlertEnabled,
        });
      } else {
        await createAlert.mutateAsync({
          watchId: item.id,
          type: 'below_base_price',
          thresholdPrice,
          isEnabled: isAlertEnabled,
        });
      }

      setIsEditingAlert(false);
    } catch (error) {
      Alert.alert(
        'Could not save alert',
        error instanceof Error ? error.message : 'Try again in a moment.',
      );
    }
  }

  async function handleRemoveAlert() {
    if (!baseAlert || !item.id) {
      return;
    }

    try {
      await deleteAlert.mutateAsync({
        alertId: baseAlert.id,
        watchId: item.id,
      });
      setIsEditingAlert(false);
      setThresholdInput('');
      setIsAlertEnabled(true);
    } catch (error) {
      Alert.alert(
        'Could not remove alert',
        error instanceof Error ? error.message : 'Try again in a moment.',
      );
    }
  }

  return (
    <View className="gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800">
      <View className="flex-row gap-3">
        {item.set?.image_url ? (
          <Image source={{ uri: item.set.image_url }} className="h-14 w-14 rounded-lg bg-neutral-100" />
        ) : (
          <View className="h-14 w-14 rounded-lg bg-neutral-100 dark:bg-neutral-700" />
        )}
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">
            {item.set?.name ?? item.set_num}
          </Text>
          <Badge label={item.country ?? '*'} variant="country" />
          <PriceDisplay price={item.currentPrice} compact />
          {isSignedIn ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {alerts.isLoading
                ? 'Loading alert status…'
                : baseAlert?.threshold_price != null
                  ? baseAlert.is_enabled
                    ? `Alert set at ${formatPrice(baseAlert.threshold_price)}`
                    : `Alert paused at ${formatPrice(baseAlert.threshold_price)}`
                  : 'No alert configured yet'}
            </Text>
          ) : (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Create an account to enable push alerts.
            </Text>
          )}
        </View>
        <Pressable
          className="self-start rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-700"
          onPress={() => onRemove({ setNum: item.set_num, country: item.country })}
        >
          <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-100">Remove</Text>
        </Pressable>
      </View>

      <View className="gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
              {isSignedIn ? 'Price alert' : 'Push alerts'}
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {isSignedIn
                ? 'Notify me when the best base price drops below this target.'
                : 'Sign in to save and sync alerts across devices.'}
            </Text>
          </View>
          <Pressable
            className="rounded-lg bg-primary-600 px-3 py-2"
            onPress={() => {
              if (!isSignedIn) {
                router.push('/auth/sign-in');
                return;
              }

              setIsEditingAlert((current) => !current);
            }}
          >
            <Text className="text-sm font-semibold text-white">
              {isSignedIn ? (isEditingAlert ? 'Close' : baseAlert ? 'Edit alert' : 'Set alert') : 'Sign in'}
            </Text>
          </Pressable>
        </View>

        {isEditingAlert && isSignedIn ? (
          <View className="gap-3">
            <TextInput
              value={thresholdInput}
              onChangeText={setThresholdInput}
              keyboardType="decimal-pad"
              placeholder="EUR 99.99"
              placeholderTextColor={colors.neutral[400]}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
                  Alert enabled
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Disabled alerts stay saved but do not trigger notifications.
                </Text>
              </View>
              <Switch
                value={isAlertEnabled}
                onValueChange={setIsAlertEnabled}
                trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
              />
            </View>
            <View className="flex-row gap-2">
              <Pressable className="flex-1 items-center rounded-lg bg-primary-600 px-4 py-3" onPress={() => void handleSaveAlert()}>
                <Text className="text-sm font-semibold text-white">
                  {baseAlert ? 'Save alert' : 'Create alert'}
                </Text>
              </Pressable>
              {baseAlert ? (
                <Pressable
                  className="items-center rounded-lg bg-neutral-200 px-4 py-3 dark:bg-neutral-700"
                  onPress={() => void handleRemoveAlert()}
                >
                  <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
                    Remove alert
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function WatchlistList({
  items,
  isSignedIn,
  onRemove,
}: {
  items: ResolvedWatchlistEntry[];
  isSignedIn: boolean;
  onRemove: (item: { setNum: string; country?: WatchlistEntry['country'] }) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Start watching sets to track prices"
        description="Use Set Detail to save price targets locally before login."
      />
    );
  }

  return (
    <View className="gap-3">
      {items.map((item) => (
        <WatchlistRow
          key={`${item.set_num}-${item.country ?? '*'}`}
          item={item}
          isSignedIn={isSignedIn}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}
