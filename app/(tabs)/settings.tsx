import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Pressable, Switch, Text, View } from 'react-native';

import { useAuth } from '@/src/features/auth/hooks';
import { useUserPlan } from '@/src/features/premium/hooks';
import { legoDisclaimer } from '@/src/content/legal';
import { useMockMode } from '@/src/hooks/useMockMode';
import { captureSentryTestEvent, isSentryConfigured } from '@/src/lib/monitoring/sentry';
import { usePreferences } from '@/src/hooks/usePreferences';
import { colors } from '@/src/theme/colors';

function SettingsLinkRow({
  label,
  description,
  onPress,
  destructive = false,
}: {
  label: string;
  description: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable className="gap-1 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900" onPress={onPress}>
      <Text
        className={`text-sm font-semibold ${
          destructive ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-100'
        }`}
      >
        {label}
      </Text>
      <Text className="text-sm text-neutral-500 dark:text-neutral-400">{description}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, isLoading: isSessionLoading, isMigrating, signOut } = useAuth();
  const plan = useUserPlan();
  const { environment, isMockMode } = useMockMode();
  const { preferences, updatePreferences } = usePreferences();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const runtimeVersion = Constants.expoConfig?.runtimeVersion;
  const versionLabel =
    runtimeVersion && runtimeVersion !== appVersion ? `${appVersion} (${runtimeVersion})` : appVersion;
  const easProjectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null;
  const sentryConfigured = isSentryConfigured();

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

      <View className="gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Plan</Text>
        <Text className="text-base text-neutral-600 dark:text-neutral-300">
          {plan.isLoading
            ? 'Checking plan…'
            : plan.data?.isPremium
              ? 'Premium active'
              : plan.data?.isExpired
                ? 'Premium expired'
                : 'Free plan'}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {plan.data?.isPastDue
            ? 'Payment issue detected. Premium access is currently in a grace period.'
            : plan.data?.isPremium
              ? 'Unlimited watchlist, full history, and advanced alerts are enabled.'
              : 'Free plan includes 20 watchlist slots, 30-day history, and one base-price alert per set.'}
        </Text>
        <Pressable
          className="self-start rounded-lg bg-primary-600 px-4 py-2.5"
          onPress={() => router.push({ pathname: '/modal/paywall', params: { reason: 'settings_plan' } })}
        >
          <Text className="text-sm font-semibold text-white">
            {plan.data?.isPremium ? 'Manage Premium' : 'Upgrade to Premium'}
          </Text>
        </Pressable>
      </View>

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">About</Text>
        <Text className="text-base text-neutral-600 dark:text-neutral-300">
          PriBrix tracks LEGO set prices for Belgium and the Netherlands using affiliate feeds and authorized APIs.
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{legoDisclaimer}</Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">App version: {versionLabel}</Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          Scope: internal beta · phone-only · premium via manual entitlements
        </Text>
      </View>

      {environment !== 'prod' ? (
        <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Beta ops</Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            EAS project {easProjectId ? 'linked' : 'missing'} · Sentry {sentryConfigured ? 'configured' : 'missing env'}
          </Text>
          <Pressable
            className={`self-start rounded-lg px-4 py-2.5 ${
              sentryConfigured ? 'bg-accent-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            onPress={() => {
              const captured = captureSentryTestEvent();

              Alert.alert(
                captured ? 'Sentry test sent' : 'Sentry not configured',
                captured
                  ? 'A test event was captured. Confirm it appears in the Sentry project for this build.'
                  : 'Set EXPO_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN before testing crash reporting.',
              );
            }}
          >
            <Text className="text-sm font-semibold text-white">Send Sentry test event</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Legal</Text>
        <SettingsLinkRow
          label="Privacy Policy"
          description="How account data, alerts, and affiliate attribution are handled."
          onPress={() => router.push('/settings/privacy-policy')}
        />
        <SettingsLinkRow
          label="Terms of Service"
          description="Usage terms, Premium notes, and limitations of liability."
          onPress={() => router.push('/settings/terms')}
        />
        <SettingsLinkRow
          label="Affiliate Disclosure"
          description="PriBrix may earn commission on qualifying retailer purchases."
          onPress={() => router.push('/settings/affiliate-disclosure')}
        />
      </View>

      {user ? (
        <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Account</Text>
          <SettingsLinkRow
            label="Delete account"
            description="Permanently remove your synced data, push tokens, and PriBrix account."
            destructive
            onPress={() => router.push('/settings/delete-account')}
          />
        </View>
      ) : null}

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
