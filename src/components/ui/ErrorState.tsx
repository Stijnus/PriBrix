import { Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title = 'Something went wrong', description, onRetry }: ErrorStateProps) {
  return (
    <View className="items-center rounded-xl border border-primary-100 bg-primary-50 px-6 py-10">
      <Text className="font-sans-bold text-2xl text-primary-500">{title}</Text>
      <Text className="mt-2 text-center font-sans text-base text-neutral-600">{description}</Text>
      {onRetry ? (
        <View className="mt-5 w-full">
          <AppButton fullWidth onPress={onRetry}>
            Try again
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}
