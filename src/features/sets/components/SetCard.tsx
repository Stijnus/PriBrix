import { Image, Pressable, Text, View } from 'react-native';
import { ArrowUpRight, BadgePercent } from 'lucide-react-native';

import { PriceDisplay } from '@/src/components/ui/PriceDisplay';
import { theme } from '@/src/theme';
import type { SetWithBestPrice } from '@/src/features/sets/types';

type SetCardProps = {
  item: SetWithBestPrice;
  onPress: () => void;
};

export function SetCard({ item, onPress }: SetCardProps) {
  const bePrice = item.bestPriceByCountry.BE?.bestBasePrice ?? null;
  const nlPrice = item.bestPriceByCountry.NL?.bestBasePrice ?? null;
  const preferredPrice = bePrice ?? nlPrice ?? item.msrp_eur ?? null;
  const originalPrice =
    item.msrp_eur != null && preferredPrice != null && item.msrp_eur > preferredPrice
      ? item.msrp_eur
      : null;
  const savingsPercent =
    originalPrice && preferredPrice != null
      ? Math.round(((originalPrice - preferredPrice) / originalPrice) * 100)
      : null;

  return (
    <Pressable
      className="flex-row gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800"
      onPress={onPress}
      style={({ pressed }) => (pressed ? { transform: [{ scale: 0.98 }] } : undefined)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} className="h-[72px] w-[72px] rounded-xl bg-neutral-100" />
      ) : (
        <View className="h-[72px] w-[72px] rounded-xl bg-neutral-100 dark:bg-neutral-700" />
      )}

      <View className="flex-1 flex-row justify-between gap-3">
        <View className="flex-1 justify-between gap-3">
          <View className="gap-1">
            <Text className="font-sans-bold text-xs uppercase tracking-[1px] text-primary-500">
              {item.theme}
            </Text>
            <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">{item.name}</Text>
            <Text className="font-mono text-sm text-neutral-500">{item.set_num}</Text>
          </View>

          <View className="gap-1">
            <PriceDisplay compact price={preferredPrice} originalPrice={originalPrice} />
            {savingsPercent != null ? (
              <View className="flex-row items-center gap-1">
                <BadgePercent color={theme.colors.success.DEFAULT} size={14} strokeWidth={2} />
                <Text className="font-sans-semibold text-sm text-success">↓ {savingsPercent}% savings</Text>
              </View>
            ) : (
              <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-300">
                Best available price
              </Text>
            )}
          </View>
        </View>

        <ArrowUpRight color={theme.colors.neutral[400]} size={18} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
