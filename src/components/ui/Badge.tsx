import { Text, View } from 'react-native';

import { classes } from '@/src/utils/classes';

type BadgeVariant =
  | 'in-stock'
  | 'out-of-stock'
  | 'unknown'
  | 'premium'
  | 'priority-high'
  | 'priority-medium'
  | 'priority-low'
  | 'country';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  'in-stock': 'bg-success-light text-success',
  'out-of-stock': 'bg-error-light text-error',
  unknown: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300',
  premium: 'bg-primary-100 text-primary-700',
  'priority-high': 'bg-error-light text-error',
  'priority-medium': 'bg-warning-light text-warning',
  'priority-low': 'bg-info-light text-info',
  country: 'bg-accent-100 text-accent-700',
};

export function Badge({ label, variant = 'unknown' }: BadgeProps) {
  return (
    <View className="self-start rounded-full px-2 py-0.5">
      <Text className={classes('text-xs font-medium', variantClasses[variant])}>{label}</Text>
    </View>
  );
}
