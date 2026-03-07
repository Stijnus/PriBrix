import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

type PremiumBadgeProps = {
  label?: string;
  interactive?: boolean;
};

export function PremiumBadge({ label = 'Premium', interactive = true }: PremiumBadgeProps) {
  if (!interactive) {
    return (
      <View className="self-start rounded-full bg-neutral-900 px-2.5 py-1">
        <Text className="font-sans-bold text-xs uppercase tracking-[0.5px] text-white">{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      className="self-start rounded-full bg-neutral-900 px-2.5 py-1"
      onPress={() => router.push('/modal/paywall')}
    >
      <Text className="font-sans-bold text-xs uppercase tracking-[0.5px] text-white">{label}</Text>
    </Pressable>
  );
}
