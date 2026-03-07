import { Pressable, Text } from 'react-native';

import { classes } from '@/src/utils/classes';

type AppChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function AppChip({ label, active = false, onPress }: AppChipProps) {
  return (
    <Pressable
      className={classes(
        'rounded-full border px-4 py-2',
        active
          ? 'border-primary-500 bg-primary-500'
          : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
      )}
      onPress={onPress}
      style={({ pressed }) => (pressed ? { transform: [{ scale: 0.98 }] } : undefined)}
    >
      <Text
        className={classes(
          'font-sans-medium text-[13px]',
          active ? 'text-white' : 'text-neutral-700 dark:text-neutral-200',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
