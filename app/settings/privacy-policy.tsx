import { Text, View } from 'react-native';

import { SettingsScreenLayout } from '@/src/components/ui/SettingsScreenLayout';
import { legoDisclaimer, privacyPolicySections } from '@/src/content/legal';

export default function PrivacyPolicyScreen() {
  return (
    <SettingsScreenLayout
      title="Privacy Policy"
      description="How PriBrix handles account data, preferences, alerts, and affiliate attribution."
    >
      <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        {privacyPolicySections.map((section) => (
          <View key={section.title} className="gap-1">
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">
              {section.title}
            </Text>
            <Text className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {section.body}
            </Text>
          </View>
        ))}
      </View>

      <View className="rounded-xl bg-accent-50 p-4 dark:bg-neutral-800">
        <Text className="text-sm font-semibold uppercase tracking-wide text-accent-700">Trademark notice</Text>
        <Text className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{legoDisclaimer}</Text>
      </View>
    </SettingsScreenLayout>
  );
}
