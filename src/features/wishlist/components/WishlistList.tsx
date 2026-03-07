import { Image, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
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
        <View
          key={item.set_num}
          className="flex-row gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800"
        >
          {item.set?.image_url ? (
            <Image source={{ uri: item.set.image_url }} className="h-14 w-14 rounded-lg bg-neutral-100" />
          ) : (
            <View className="h-14 w-14 rounded-lg bg-neutral-100 dark:bg-neutral-700" />
          )}
          <View className="flex-1 gap-1">
            <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">
              {item.set?.name ?? item.set_num}
            </Text>
            <Badge label={(item.priority ?? 'medium').toUpperCase()} variant={getPriorityVariant(item.priority)} />
          </View>
          <View className="self-start">
            <AppButton size="sm" variant="secondary" onPress={() => onRemove(item.set_num)}>
              Remove
            </AppButton>
          </View>
        </View>
      ))}
    </View>
  );
}
