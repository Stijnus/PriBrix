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
import type { AlertType } from '@/src/features/alerts/types';
import { PremiumBadge } from '@/src/features/premium/components/PremiumBadge';
import { UpgradePrompt } from '@/src/features/premium/components/UpgradePrompt';
import { useEntitlements } from '@/src/features/premium/hooks';
import { trackAlertCreated } from '@/src/lib/analytics/events';
import type { Set } from '@/src/lib/validation/sets';
import { colors } from '@/src/theme/colors';
import { classes } from '@/src/utils/classes';
import { formatPrice } from '@/src/utils/formatPrice';

import type { WatchlistEntry } from '../hooks';

export type ResolvedWatchlistEntry = WatchlistEntry & {
  set: Set | null;
  currentPrice: number | null;
};

const alertTypeOptions = [
  { type: 'below_base_price', label: 'Base target' },
  { type: 'below_delivered_price', label: 'Delivered target' },
  { type: 'percent_drop_30d', label: '30d drop %' },
  { type: 'lowest_90d', label: '90d low' },
] as const satisfies { type: AlertType; label: string }[];

function getAlertSummary(
  alert:
    | {
        type: AlertType;
        threshold_price: number | null;
        threshold_percent: number | null;
        is_enabled: boolean;
      }
    | null,
) {
  if (!alert) {
    return 'No alert configured yet';
  }

  if (alert.type === 'percent_drop_30d') {
    return alert.is_enabled
      ? `Alert set at ${alert.threshold_percent ?? 0}% drop`
      : `Alert paused at ${alert.threshold_percent ?? 0}% drop`;
  }

  if (alert.type === 'lowest_90d') {
    return alert.is_enabled ? 'Alert set for 90-day low' : 'Alert paused for 90-day low';
  }

  return alert.is_enabled
    ? `Alert set at ${formatPrice(alert.threshold_price)}`
    : `Alert paused at ${formatPrice(alert.threshold_price)}`;
}

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
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType>('below_base_price');
  const [thresholdInput, setThresholdInput] = useState('');
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const alerts = useAlerts(item.id, isSignedIn && Boolean(item.id));
  const { entitlements } = useEntitlements();
  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();
  const selectedAlert = useMemo(
    () => alerts.items.find((alert) => alert.type === selectedAlertType) ?? null,
    [alerts.items, selectedAlertType],
  );
  const primaryAlert = alerts.items[0] ?? null;

  useEffect(() => {
    if (selectedAlert?.threshold_price != null) {
      setThresholdInput(String(selectedAlert.threshold_price));
    } else if (selectedAlert?.threshold_percent != null) {
      setThresholdInput(String(selectedAlert.threshold_percent));
    } else if (item.target_base_price != null && selectedAlertType === 'below_base_price') {
      setThresholdInput(String(item.target_base_price));
    } else {
      setThresholdInput('');
    }

    setIsAlertEnabled(selectedAlert?.is_enabled ?? true);
  }, [
    item.target_base_price,
    selectedAlert?.id,
    selectedAlert?.is_enabled,
    selectedAlert?.threshold_percent,
    selectedAlert?.threshold_price,
    selectedAlertType,
  ]);

  function openPaywall() {
    router.push({ pathname: '/modal/paywall', params: { reason: 'alerts_upgrade' } });
  }

  async function handleSaveAlert() {
    if (!isSignedIn) {
      router.push('/auth/sign-in');
      return;
    }

    if (!item.id) {
      Alert.alert('Alert unavailable', 'This watchlist item is not synced yet.');
      return;
    }

    if (!entitlements.alertTypes.includes(selectedAlertType)) {
      openPaywall();
      return;
    }

    if (
      entitlements.alertsPerSet != null &&
      alerts.items.length >= entitlements.alertsPerSet &&
      !selectedAlert
    ) {
      openPaywall();
      return;
    }

    const normalizedInput = thresholdInput.replace(',', '.').trim();
    const numericValue = normalizedInput ? Number.parseFloat(normalizedInput) : undefined;
    const requiresPrice =
      selectedAlertType === 'below_base_price' || selectedAlertType === 'below_delivered_price';
    const requiresPercent = selectedAlertType === 'percent_drop_30d';

    if (requiresPrice && (!Number.isFinite(numericValue) || (numericValue ?? 0) <= 0)) {
      Alert.alert('Enter a valid price', 'Use a target price above zero in EUR.');
      return;
    }

    if (requiresPercent && (!Number.isFinite(numericValue) || (numericValue ?? 0) <= 0)) {
      Alert.alert('Enter a valid drop', 'Use a percentage drop above zero.');
      return;
    }

    try {
      if (selectedAlert) {
        await updateAlert.mutateAsync({
          alertId: selectedAlert.id,
          thresholdPrice: requiresPrice ? numericValue : null,
          thresholdPercent: requiresPercent ? numericValue : null,
          isEnabled: isAlertEnabled,
        });
      } else {
        await createAlert.mutateAsync({
          watchId: item.id,
          type: selectedAlertType,
          thresholdPrice: requiresPrice ? numericValue : undefined,
          thresholdPercent: requiresPercent ? numericValue : undefined,
          isEnabled: isAlertEnabled,
        });
        trackAlertCreated(
          item.set_num,
          selectedAlertType,
          typeof numericValue === 'number' && Number.isFinite(numericValue) ? numericValue : null,
        );
      }

      setIsEditingAlert(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again in a moment.';

      if (message.toLowerCase().includes('free plan')) {
        openPaywall();
        return;
      }

      Alert.alert('Could not save alert', message);
    }
  }

  async function handleRemoveAlert() {
    if (!selectedAlert || !item.id) {
      return;
    }

    try {
      await deleteAlert.mutateAsync({
        alertId: selectedAlert.id,
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
              {alerts.isLoading ? 'Loading alert status…' : getAlertSummary(primaryAlert)}
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
              {isSignedIn ? 'Price alerts' : 'Push alerts'}
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              {isSignedIn
                ? 'Configure alerts for this watched set.'
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
              {isSignedIn ? (isEditingAlert ? 'Close' : alerts.items.length > 0 ? 'Manage alerts' : 'Set alert') : 'Sign in'}
            </Text>
          </Pressable>
        </View>

        {alerts.items.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {alerts.items.map((alert) => (
              <View key={alert.id} className="rounded-full bg-white px-3 py-1.5 dark:bg-neutral-800">
                <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {getAlertSummary(alert)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {isEditingAlert && isSignedIn ? (
          <View className="gap-3">
            <View className="flex-row flex-wrap gap-2">
              {alertTypeOptions.map((option) => {
                const isAllowed = entitlements.alertTypes.includes(option.type);

                return (
                  <Pressable
                    key={option.type}
                    className={classes(
                      'rounded-full px-3 py-1.5',
                      selectedAlertType === option.type
                        ? 'bg-primary-100'
                        : 'bg-neutral-100 dark:bg-neutral-800',
                    )}
                    onPress={() => {
                      if (!isAllowed) {
                        openPaywall();
                        return;
                      }

                      setSelectedAlertType(option.type);
                    }}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Text
                        className={
                          selectedAlertType === option.type
                            ? 'text-sm font-medium text-primary-700'
                            : 'text-sm font-medium text-neutral-500 dark:text-neutral-300'
                        }
                      >
                        {option.label}
                      </Text>
                      {!isAllowed ? <PremiumBadge interactive={false} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {selectedAlertType !== 'lowest_90d' ? (
              <TextInput
                value={thresholdInput}
                onChangeText={setThresholdInput}
                keyboardType="decimal-pad"
                placeholder={
                  selectedAlertType === 'percent_drop_30d' ? 'Drop percentage, e.g. 10' : 'EUR 99.99'
                }
                placeholderTextColor={colors.neutral[400]}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            ) : (
              <View className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
                <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                  Trigger when this set hits a new 90-day low in your selected country.
                </Text>
              </View>
            )}

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
              <Pressable
                className="flex-1 items-center rounded-lg bg-primary-600 px-4 py-3"
                onPress={() => void handleSaveAlert()}
              >
                <Text className="text-sm font-semibold text-white">
                  {selectedAlert ? 'Save alert' : 'Create alert'}
                </Text>
              </Pressable>
              {selectedAlert ? (
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

            {entitlements.alertTypes.length === 1 ? (
              <UpgradePrompt
                title="Advanced alerts"
                description="Premium unlocks delivered-price alerts, 30-day drop alerts, and 90-day low alerts."
                ctaLabel="See Premium"
                reason="alerts_upgrade"
              />
            ) : null}
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
