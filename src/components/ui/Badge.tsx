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
  | 'country'
  | 'red'
  | 'red-soft'
  | 'success'
  | 'warning'
  | 'dark'
  | 'gray'
  | 'outline';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const containerClasses: Record<BadgeVariant, string> = {
  'in-stock': 'bg-success-light',
  'out-of-stock': 'bg-neutral-100 dark:bg-neutral-700',
  unknown: 'bg-neutral-100 dark:bg-neutral-700',
  premium: 'bg-neutral-900',
  'priority-high': 'bg-primary-100',
  'priority-medium': 'bg-warning-light',
  'priority-low': 'bg-info-light',
  country: 'bg-primary-100',
  red: 'bg-primary-500',
  'red-soft': 'bg-primary-100',
  success: 'bg-success-light',
  warning: 'bg-warning-light',
  dark: 'bg-neutral-900',
  gray: 'bg-neutral-100',
  outline: 'bg-transparent border-[1.5px] border-neutral-300',
};

const textClasses: Record<BadgeVariant, string> = {
  'in-stock': 'text-success',
  'out-of-stock': 'text-neutral-600 dark:text-neutral-200',
  unknown: 'text-neutral-500 dark:text-neutral-300',
  premium: 'text-white',
  'priority-high': 'text-primary-500',
  'priority-medium': 'text-warning',
  'priority-low': 'text-info',
  country: 'text-primary-500',
  red: 'text-white',
  'red-soft': 'text-primary-500',
  success: 'text-success',
  warning: 'text-warning',
  dark: 'text-white',
  gray: 'text-neutral-600',
  outline: 'text-neutral-700',
};

export function Badge({ label, variant = 'unknown' }: BadgeProps) {
  return (
    <View
      className={classes(
        'self-start rounded-full px-2.5 py-1',
        containerClasses[variant],
      )}
    >
      <Text
        className={classes(
          'font-sans-bold text-xs uppercase tracking-[0.5px]',
          textClasses[variant],
        )}
      >
        {label}
      </Text>
    </View>
  );
}
