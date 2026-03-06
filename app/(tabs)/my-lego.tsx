import { ScrollView, Text, View } from 'react-native';

import { watchlistFixture } from '@/src/lib/mock/fixtures/watchlist';

export default function MyLegoScreen() {
  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="gap-2">
        <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">My LEGO</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Owned, wishlist, and watching flows stay local-first for anonymous users. Server sync is added in Phase 5.
        </Text>
      </View>

      <View className="flex-row gap-2">
        {['Owned', 'Wishlist', 'Watching'].map((label, index) => (
          <View
            key={label}
            className={`rounded-full px-3 py-1.5 ${index === 0 ? 'bg-primary-100' : 'bg-neutral-100 dark:bg-neutral-800'}`}
          >
            <Text
              className={`text-sm font-medium ${index === 0 ? 'text-primary-700' : 'text-neutral-500 dark:text-neutral-400'}`}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View className="gap-3">
        {watchlistFixture.map((item) => (
          <View key={`${item.set_num}-${item.country ?? '*'}`} className="rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800">
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">{item.set_num}</Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              Country scope: {item.country ?? '*'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
