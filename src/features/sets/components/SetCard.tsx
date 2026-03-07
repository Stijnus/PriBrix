import { Image, Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import type { SetWithBestPrice } from '@/src/features/sets/types';

type SetCardProps = {
  item: SetWithBestPrice;
  onPress: () => void;
};

export function SetCard({ item, onPress }: SetCardProps) {
  const bePrice = item.bestPriceByCountry.BE?.bestBasePrice ?? null;
  const nlPrice = item.bestPriceByCountry.NL?.bestBasePrice ?? null;

  return (
    <Pressable className="flex-row gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800" onPress={onPress}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} className="h-20 w-20 rounded-lg bg-neutral-100" />
      ) : (
        <View className="h-20 w-20 rounded-lg bg-neutral-100 dark:bg-neutral-700" />
      )}

      <View className="flex-1 gap-2">
        <View className="gap-1">
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">{item.name}</Text>
          <Text className="text-xs text-neutral-400">{item.set_num}</Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">{item.theme}</Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <View className="min-w-[110px] gap-1">
            <Badge label="BE" variant="country" />
            <PriceDisplay price={bePrice} compact />
          </View>
          <View className="min-w-[110px] gap-1">
            <Badge label="NL" variant="country" />
            <PriceDisplay price={nlPrice} compact />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
