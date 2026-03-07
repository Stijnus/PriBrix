import { Pressable, Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center rounded-xl bg-white px-6 py-10 shadow-sm dark:bg-neutral-800">
      <Text className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">{title}</Text>
      <Text className="mt-2 text-center text-base text-neutral-500 dark:text-neutral-400">
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Pressable className="mt-5 rounded-lg bg-primary-600 px-5 py-3" onPress={onAction}>
          <Text className="text-base font-semibold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
