import { ScrollView, Text, View } from 'react-native';

import { useSession } from '@/src/lib/auth/session';

export default function SettingsScreen() {
  const { user, isLoading } = useSession();

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="gap-2">
        <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Settings</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          User preferences, auth controls, legal pages, and premium settings are layered in later phases.
        </Text>
      </View>

      <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Session</Text>
        <Text className="mt-2 text-base text-neutral-600 dark:text-neutral-300">
          {isLoading ? 'Checking session…' : user?.email ?? 'Anonymous mode'}
        </Text>
      </View>

      <View className="gap-3">
        <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">Default country</Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">BE</Text>
        </View>
        <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">Delivered price</Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Enabled later in Phase 3</Text>
        </View>
      </View>
    </ScrollView>
  );
}
