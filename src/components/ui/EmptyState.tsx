import { Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center rounded-xl border border-neutral-100 bg-white px-6 py-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
      <Text className="font-sans-bold text-2xl text-neutral-900 dark:text-white">{title}</Text>
      <Text className="mt-2 text-center font-sans text-base text-neutral-600 dark:text-neutral-300">
        {description}
      </Text>
      {actionLabel && onAction ? (
        <View className="mt-5 w-full">
          <AppButton fullWidth onPress={onAction}>
            {actionLabel}
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}
