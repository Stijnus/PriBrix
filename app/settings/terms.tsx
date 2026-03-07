import { Text, View } from 'react-native';

import { SettingsScreenLayout } from '@/src/components/ui/SettingsScreenLayout';
import { legoDisclaimer, termsSections } from '@/src/content/legal';

export default function TermsScreen() {
  return (
    <SettingsScreenLayout
      title="Terms of Service"
      description="The core rules for using PriBrix, retailer links, and Premium access."
    >
      <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        {termsSections.map((section) => (
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

      <View className="rounded-xl bg-warning-light p-4">
        <Text className="text-sm font-semibold uppercase tracking-wide text-warning">Non-affiliation</Text>
        <Text className="mt-1 text-sm text-neutral-700">{legoDisclaimer}</Text>
      </View>
    </SettingsScreenLayout>
  );
}
