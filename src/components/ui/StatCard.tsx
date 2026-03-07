import { Text, View } from 'react-native';

import { classes } from '@/src/utils/classes';

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  negative?: boolean;
};

export function StatCard({ label, value, detail, negative = false }: StatCardProps) {
  return (
    <View className="flex-1 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
      <Text className="font-sans-semibold text-xs uppercase tracking-[1.5px] text-neutral-500">
        {label}
      </Text>
      <Text className="mt-2 font-sans-extrabold text-4xl tracking-[-1px] text-neutral-900 dark:text-white">
        {value}
      </Text>
      <Text
        className={classes(
          'mt-1 font-sans-semibold text-sm',
          negative ? 'text-primary-500' : 'text-success',
        )}
      >
        {detail}
      </Text>
    </View>
  );
}
