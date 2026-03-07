import { Text, View } from 'react-native';

import { formatPrice } from '@/src/utils/formatPrice';

type PriceDisplayProps = {
  price: number | null | undefined;
  originalPrice?: number | null;
  label?: string;
  compact?: boolean;
};

export function PriceDisplay({ price, originalPrice, label, compact = false }: PriceDisplayProps) {
  return (
    <View className="gap-0.5">
      {label ? (
        <Text className="text-xs font-semibold uppercase tracking-wide text-primary-600">{label}</Text>
      ) : null}
      <Text className={compact ? 'text-base font-bold text-neutral-800 dark:text-neutral-50' : 'text-xl font-bold text-neutral-800 dark:text-neutral-50'}>
        {formatPrice(price)}
      </Text>
      {originalPrice != null && originalPrice > 0 ? (
        <Text className="text-sm font-normal text-neutral-400 line-through">
          {formatPrice(originalPrice)}
        </Text>
      ) : null}
    </View>
  );
}
