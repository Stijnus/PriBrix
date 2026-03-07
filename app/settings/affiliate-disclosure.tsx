import { Text, View } from 'react-native';

import { SettingsScreenLayout } from '@/src/components/ui/SettingsScreenLayout';
import { affiliateDisclosureSections } from '@/src/content/legal';

export default function AffiliateDisclosureScreen() {
  return (
    <SettingsScreenLayout
      title="Affiliate Disclosure"
      description="PriBrix may earn commission from qualifying purchases made through retailer links."
    >
      <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        {affiliateDisclosureSections.map((section) => (
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
    </SettingsScreenLayout>
  );
}
