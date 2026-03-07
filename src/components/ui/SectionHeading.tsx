import { Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';

type SectionHeadingProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeading({ title, actionLabel, onAction }: SectionHeadingProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="font-sans-bold text-2xl text-neutral-900 dark:text-white">{title}</Text>
      {actionLabel && onAction ? (
        <AppButton variant="ghost" size="sm" onPress={onAction}>
          {actionLabel}
        </AppButton>
      ) : null}
    </View>
  );
}
