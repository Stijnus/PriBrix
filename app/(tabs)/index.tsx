import { ScrollView, Text, View } from 'react-native';

import { setsFixture } from '@/src/lib/mock/fixtures/sets';
import { useMockMode } from '@/src/hooks/useMockMode';
import { formatPrice } from '@/src/utils/formatPrice';

const featuredSets = setsFixture.slice(0, 3);

export default function HomeScreen() {
  const { isMockMode, environment } = useMockMode();

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          PriBrix
        </Text>
        <Text className="text-3xl font-bold text-neutral-700 dark:text-neutral-100">
          Anonymous-first LEGO price tracking for BE and NL.
        </Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Phase 0 is live: Expo Router, NativeWind, Supabase wiring, mock data, and project tooling are in place.
        </Text>
      </View>

      <View className="rounded-xl bg-primary-50 p-4 dark:bg-neutral-800">
        <Text className="text-sm font-medium text-primary-700">
          Environment: {environment.toUpperCase()}
        </Text>
        <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Mock mode is {isMockMode ? 'enabled' : 'disabled'}.
        </Text>
      </View>

      <View className="gap-3">
        <Text className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">
          Featured placeholders
        </Text>
        {featuredSets.map((set) => (
          <View
            key={set.id}
            className="flex-row items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-neutral-800"
          >
            <View className="mr-4 flex-1 gap-1">
              <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">
                {set.name}
              </Text>
              <Text className="text-xs text-neutral-400">{set.set_num}</Text>
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">{set.theme}</Text>
            </View>
            <Text className="text-lg font-bold text-neutral-800 dark:text-neutral-50">
              {formatPrice(set.msrp_eur, 'nl-BE')}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
