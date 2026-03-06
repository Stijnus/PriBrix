import { ScrollView, Text, View } from 'react-native';

import { setsFixture } from '@/src/lib/mock/fixtures/sets';

export default function SearchScreen() {
  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="gap-2">
        <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Search</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Phase 0 ships a placeholder search surface. Real catalog querying arrives in Phase 3 after the Supabase schema and catalog import are ready.
        </Text>
      </View>

      <View className="rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
        <Text className="text-base text-neutral-400">Search for a LEGO set by name or number</Text>
      </View>

      <View className="gap-3">
        {setsFixture.slice(0, 5).map((set) => (
          <View key={set.id} className="rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800">
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">{set.name}</Text>
            <Text className="text-xs text-neutral-400">{set.set_num}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
