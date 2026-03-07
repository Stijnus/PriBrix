import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

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
  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerClassName="gap-6 px-4 py-6"
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">{title}</Text>
          {description ? (
            <Text className="text-base text-neutral-500 dark:text-neutral-400">{description}</Text>
          ) : null}
        </View>
        <Pressable
          className="rounded-lg bg-white px-4 py-2 dark:bg-neutral-800"
          onPress={() => router.back()}
        >
          <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Back</Text>
        </Pressable>
      </View>

      {children}
    </ScrollView>
  );
}
