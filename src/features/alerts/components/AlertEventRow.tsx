import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import type { AlertEventHistoryItem } from '@/src/lib/validation/alerts';
import { formatRelativeTime } from '@/src/utils/formatRelativeTime';

function getAlertTypeLabel(type: AlertEventHistoryItem['alert_type']) {
  switch (type) {
    case 'below_delivered_price':
      return 'Delivered';
    case 'percent_drop_30d':
      return '30d drop';
    case 'lowest_90d':
      return '90d low';
    default:
      return 'Base';
  }
}

export function AlertEventRow({
  item,
  onPress,
}: {
  item: AlertEventHistoryItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800"
      onPress={onPress}
      style={({ pressed }) => (pressed ? { transform: [{ scale: 0.98 }] } : undefined)}
    >
      {item.set_image_url ? (
        <Image source={{ uri: item.set_image_url }} className="h-14 w-14 rounded-lg bg-neutral-100" />
      ) : (
        <View className="h-14 w-14 rounded-lg bg-neutral-100 dark:bg-neutral-700" />
      )}
      <View className="flex-1 gap-1">
        <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">
          {item.set_name}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label={item.watch_country} variant="country" />
          <Badge label={getAlertTypeLabel(item.alert_type)} variant="unknown" />
          {item.sent_push ? (
            <Badge label="Push sent" variant="premium" />
          ) : null}
        </View>
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
          {item.retailer_name ?? 'Best price updated'} · {formatRelativeTime(item.triggered_at)}
        </Text>
      </View>
      <View className="items-end gap-1">
        <PriceDisplay price={item.trigger_price} compact />
        <Text className="font-sans-semibold text-xs uppercase tracking-[0.5px] text-primary-500">
          View set
        </Text>
      </View>
    </Pressable>
  );
}
