import { Image, Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { EmptyState } from '@/src/components/ui/EmptyState';
import type { Set } from '@/src/lib/validation/sets';

import type { OwnedEntry } from '../hooks';

export type ResolvedOwnedEntry = OwnedEntry & {
  set: Set | null;
};

type OwnedListProps = {
  items: ResolvedOwnedEntry[];
  onRemove: (setNum: string) => void;
};

export function OwnedList({ items, onRemove }: OwnedListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No sets in your collection yet"
        description="Add a set from Set Detail to start building your local collection."
      />
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
            <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
              Qty {item.quantity ?? 1} · {item.condition ?? 'sealed'}
            </Text>
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
