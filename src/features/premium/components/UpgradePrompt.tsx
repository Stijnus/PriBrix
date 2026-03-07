import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

type UpgradePromptProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  reason?: string;
};

export function UpgradePrompt({
  title,
  description,
  ctaLabel = 'Upgrade to Premium',
  reason = 'upgrade_prompt',
}: UpgradePromptProps) {
  return (
    <View className="gap-3 rounded-xl bg-primary-50 p-4">
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">{title}</Text>
        <Text className="text-sm text-neutral-600">{description}</Text>
      </View>
      <Pressable
        className="self-start rounded-lg bg-primary-600 px-4 py-2.5"
        onPress={() => router.push({ pathname: '/modal/paywall', params: { reason } })}
      >
        <Text className="text-sm font-semibold text-white">{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}
