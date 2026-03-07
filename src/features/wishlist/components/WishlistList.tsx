import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import type { Set } from '@/src/lib/validation/sets';

import type { WishlistEntry } from '../hooks';

export type ResolvedWishlistEntry = WishlistEntry & {
  set: Set | null;
};

function getPriorityVariant(priority: WishlistEntry['priority']) {
  if (priority === 'high') {
    return 'priority-high';
  }

  if (priority === 'low') {
    return 'priority-low';
  }

  return 'priority-medium';
}

export function WishlistList({
  items,
  onRemove,
}: {
  items: ResolvedWishlistEntry[];
  onRemove: (setNum: string) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState title="Your wishlist is empty" description="Save interesting sets from Set Detail for later." />
    );
  }

  return (
    <View className="gap-3">
      {items.map((item) => (
        <View key={item.set_num} className="flex-row gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800">
          {item.set?.image_url ? (
            <Image source={{ uri: item.set.image_url }} className="h-14 w-14 rounded-lg bg-neutral-100" />
          ) : (
            <View className="h-14 w-14 rounded-lg bg-neutral-100 dark:bg-neutral-700" />
          )}
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">
              {item.set?.name ?? item.set_num}
            </Text>
            <Badge label={(item.priority ?? 'medium').toUpperCase()} variant={getPriorityVariant(item.priority)} />
          </View>
          <Pressable className="self-start rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-700" onPress={() => onRemove(item.set_num)}>
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-100">Remove</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
