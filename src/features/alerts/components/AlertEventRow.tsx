import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import type { AlertEventHistoryItem } from '@/src/lib/validation/alerts';
import { formatRelativeTime } from '@/src/utils/formatRelativeTime';

export function AlertEventRow({
  item,
  onPress,
}: {
  item: AlertEventHistoryItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800"
      onPress={onPress}
    >
      {item.set_image_url ? (
        <Image source={{ uri: item.set_image_url }} className="h-14 w-14 rounded-lg bg-neutral-100" />
      ) : (
        <View className="h-14 w-14 rounded-lg bg-neutral-100 dark:bg-neutral-700" />
      )}
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">
          {item.set_name}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label={item.watch_country} variant="country" />
          {item.sent_push ? (
            <Badge label="Push sent" variant="premium" />
          ) : null}
        </View>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {item.retailer_name ?? 'Best price updated'} · {formatRelativeTime(item.triggered_at)}
        </Text>
      </View>
      <View className="items-end gap-1">
        <PriceDisplay price={item.trigger_price} compact />
        <Text className="text-xs font-medium text-primary-600">View set</Text>
      </View>
    </Pressable>
  );
}
