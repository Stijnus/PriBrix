import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';

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
    <View className="gap-3 rounded-xl border border-primary-100 bg-primary-50 p-5">
      <View className="gap-1">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">
          {title}
        </Text>
        <Text className="font-sans text-sm text-neutral-600">{description}</Text>
      </View>
      <View className="self-start">
        <AppButton size="sm" onPress={() => router.push({ pathname: '/modal/paywall', params: { reason } })}>
          {ctaLabel}
        </AppButton>
      </View>
    </View>
  );
}
