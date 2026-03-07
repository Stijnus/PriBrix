import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

type PremiumBadgeProps = {
  label?: string;
  interactive?: boolean;
};

export function PremiumBadge({ label = 'Premium', interactive = true }: PremiumBadgeProps) {
  if (!interactive) {
    return (
      <View className="self-start rounded-full bg-primary-100 px-2 py-0.5">
        <Text className="text-xs font-medium text-primary-700">{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      className="self-start rounded-full bg-primary-100 px-2 py-0.5"
      onPress={() => router.push('/modal/paywall')}
    >
      <Text className="text-xs font-medium text-primary-700">{label}</Text>
    </Pressable>
  );
}
