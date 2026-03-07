import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import type { Set } from '@/src/lib/validation/sets';

import type { WatchlistEntry } from '../hooks';

export type ResolvedWatchlistEntry = WatchlistEntry & {
  set: Set | null;
  currentPrice: number | null;
};

export function WatchlistList({
  items,
  onRemove,
}: {
  items: ResolvedWatchlistEntry[];
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
        <View
          key={`${item.set_num}-${item.country ?? '*'}`}
          className="flex-row gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800"
        >
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
          </View>
          <Pressable
            className="self-start rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-700"
            onPress={() => onRemove({ setNum: item.set_num, country: item.country })}
          >
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-100">Remove</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
