import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import type { SetWithBestPrice } from '@/src/features/sets/types';
import { classes } from '@/src/utils/classes';

type CollectionSetCardProps = {
  item: SetWithBestPrice;
  onPress: () => void;
  country: 'BE' | 'NL';
};

export function CollectionSetCard({ item, onPress, country }: CollectionSetCardProps) {
  const price = item.bestPriceByCountry[country]?.bestBasePrice ?? item.msrp_eur ?? null;
  const originalPrice = item.msrp_eur && price != null && item.msrp_eur > price ? item.msrp_eur : null;
  const savingsPercent =
    originalPrice && price != null ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  return (
    <Pressable
      className="flex-1 overflow-hidden rounded-xl bg-white shadow-md dark:bg-neutral-800"
      onPress={onPress}
      style={({ pressed }) => (pressed ? { transform: [{ scale: 0.98 }] } : undefined)}
    >
      <View className="relative aspect-square items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full bg-neutral-100 dark:bg-neutral-900" />
        )}
        <View className="absolute right-3 top-3">
          <Badge
            label={savingsPercent != null ? `↓ ${savingsPercent}%` : country}
            variant={savingsPercent != null ? 'in-stock' : 'country'}
          />
        </View>
      </View>
      <View className="gap-3 p-4">
        <View className="gap-1">
          <Text className="font-sans-bold text-xs uppercase tracking-[1px] text-primary-500">
            {item.theme}
          </Text>
          <Text
            className={classes(
              'font-sans-bold text-lg text-neutral-900 dark:text-white',
              !item.image_url && 'min-h-[44px]',
            )}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
        <PriceDisplay compact price={price} originalPrice={originalPrice} />
      </View>
    </Pressable>
  );
}
