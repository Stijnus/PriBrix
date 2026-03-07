import { Pressable, Text, View } from 'react-native';

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title = 'Something went wrong', description, onRetry }: ErrorStateProps) {
  return (
    <View className="items-center rounded-xl bg-error-light px-6 py-10">
      <Text className="text-xl font-semibold text-error">{title}</Text>
      <Text className="mt-2 text-center text-base text-neutral-600">{description}</Text>
      {onRetry ? (
        <Pressable className="mt-5 rounded-lg bg-error px-5 py-3" onPress={onRetry}>
          <Text className="text-base font-semibold text-white">Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
