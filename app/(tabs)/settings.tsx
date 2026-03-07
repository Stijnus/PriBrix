import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/src/features/auth/hooks';
import { useMockMode } from '@/src/hooks/useMockMode';
import { usePreferences } from '@/src/hooks/usePreferences';
import { colors } from '@/src/theme/colors';

export default function SettingsScreen() {
  const { user, isLoading: isSessionLoading, isMigrating, signOut } = useAuth();
  const { environment, isMockMode } = useMockMode();
  const { preferences, updatePreferences } = usePreferences();

  return (
    <View className="flex-1 gap-6 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
      <View className="gap-2">
        <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Settings</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Local preferences are active immediately and persist across app restarts.
        </Text>
      </View>

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">Default country</Text>
        <View className="flex-row gap-2">
          {(['BE', 'NL'] as const).map((country) => (
            <Text
              key={country}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                preferences.country === country
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300'
              }`}
              onPress={() => void updatePreferences({ country })}
            >
              {country}
            </Text>
          ))}
        </View>
      </View>

      <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">
              Show delivered price
            </Text>
            <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Toggle between base prices and delivered prices in set detail offers.
            </Text>
          </View>
          <Switch
            value={preferences.showDeliveredPrice}
            onValueChange={(value) => void updatePreferences({ showDeliveredPrice: value })}
            trackColor={{ false: colors.neutral[300], true: colors.primary[600] }}
          />
        </View>
      </View>

      <View className="gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Session</Text>
        <Text className="text-base text-neutral-600 dark:text-neutral-300">
          {isSessionLoading ? 'Checking session…' : user?.email ?? 'Anonymous mode'}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          Environment: {environment.toUpperCase()} · Mock mode {isMockMode ? 'enabled' : 'disabled'} ·{' '}
          {isMigrating ? 'Syncing lists…' : user ? 'Server lists active' : 'Local lists active'}
        </Text>
      </View>

      {user ? (
        <Pressable
          className="items-center rounded-lg bg-neutral-800 px-5 py-3 dark:bg-neutral-700"
          onPress={() => {
            void signOut().then(() => {
              router.replace('/');
            });
          }}
        >
          <Text className="text-base font-semibold text-white">Sign out</Text>
        </Pressable>
      ) : (
        <Pressable
          className="items-center rounded-lg bg-primary-600 px-5 py-3"
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text className="text-base font-semibold text-white">Sign in to sync lists</Text>
        </Pressable>
      )}
    </View>
  );
}
