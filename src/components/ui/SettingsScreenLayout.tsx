import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { theme } from '@/src/theme';

type SettingsScreenLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SettingsScreenLayout({
  title,
  description,
  children,
}: SettingsScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerClassName="gap-6 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 24 }}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">{title}</Text>
          {description ? (
            <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">{description}</Text>
          ) : null}
        </View>
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-neutral-800"
          onPress={() => router.back()}
        >
          <ChevronLeft color={theme.colors.neutral[700]} size={20} strokeWidth={2} />
        </Pressable>
      </View>

      {children}
    </ScrollView>
  );
}
