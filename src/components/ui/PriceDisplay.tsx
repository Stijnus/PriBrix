import { Text, View } from 'react-native';

import { classes } from '@/src/utils/classes';
import { formatPrice } from '@/src/utils/formatPrice';

type PriceDisplayProps = {
  price: number | null | undefined;
  originalPrice?: number | null;
  label?: string;
  compact?: boolean;
  hero?: boolean;
};

export function PriceDisplay({
  price,
  originalPrice,
  label,
  compact = false,
  hero = false,
}: PriceDisplayProps) {
  return (
    <View className="gap-1">
      {label ? (
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
          {label}
        </Text>
      ) : null}
      <Text
        className={classes(
          'font-mono text-neutral-900 dark:text-white',
          hero ? 'text-4xl' : compact ? 'text-lg' : 'text-2xl',
        )}
      >
        {formatPrice(price)}
      </Text>
      {originalPrice != null && originalPrice > 0 ? (
        <Text className="font-mono text-sm text-neutral-400 line-through">
          {formatPrice(originalPrice)}
        </Text>
      ) : null}
    </View>
  );
}
