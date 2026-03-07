import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppChip } from '@/src/components/ui/AppChip';
import { useAuth } from '@/src/features/auth/hooks';
import { useUserPlan } from '@/src/features/premium/hooks';
import { legoDisclaimer } from '@/src/content/legal';
import { useMockMode } from '@/src/hooks/useMockMode';
import { captureSentryTestEvent, isSentryConfigured } from '@/src/lib/monitoring/sentry';
import { usePreferences } from '@/src/hooks/usePreferences';
import { theme } from '@/src/theme';

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
    <Pressable
      className="gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-3 dark:border-neutral-700 dark:bg-neutral-900"
      onPress={onPress}
    >
      <Text
        className={`font-sans-semibold text-sm ${
          destructive ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-100'
        }`}
      >
        {label}
      </Text>
      <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">{description}</Text>
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
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerClassName="gap-6 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 24 }}
    >
      <View className="gap-2">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Settings</Text>
        <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">Preferences & account</Text>
        <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
          Local preferences are active immediately and persist across app restarts.
        </Text>
      </View>

      <View className="gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">Default country</Text>
        <View className="flex-row gap-2">
          {(['BE', 'NL'] as const).map((country) => (
            <AppChip
              key={country}
              label={country}
              active={preferences.country === country}
              onPress={() => void updatePreferences({ country })}
            />
          ))}
        </View>
      </View>

      <View className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="font-sans-bold text-lg text-neutral-900 dark:text-white">
              Show delivered price
            </Text>
            <Text className="mt-1 font-sans text-sm text-neutral-500 dark:text-neutral-400">
              Toggle between base prices and delivered prices in set detail offers.
            </Text>
          </View>
          <Switch
            value={preferences.showDeliveredPrice}
            onValueChange={(value) => void updatePreferences({ showDeliveredPrice: value })}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] }}
          />
        </View>
      </View>

      <View className="gap-2 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Session</Text>
        <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
          {isSessionLoading ? 'Checking session…' : user?.email ?? 'Anonymous mode'}
        </Text>
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
          Environment: {environment.toUpperCase()} · Mock mode {isMockMode ? 'enabled' : 'disabled'} ·{' '}
          {isMigrating ? 'Syncing lists…' : user ? 'Server lists active' : 'Local lists active'}
        </Text>
      </View>

      <View className="gap-2 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Plan</Text>
        <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
          {plan.isLoading
            ? 'Checking plan…'
            : plan.data?.isPremium
              ? 'Premium active'
              : plan.data?.isExpired
                ? 'Premium expired'
                : 'Free plan'}
        </Text>
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
          {plan.data?.isPastDue
            ? 'Payment issue detected. Premium access is currently in a grace period.'
            : plan.data?.isPremium
              ? 'Unlimited watchlist, full history, and advanced alerts are enabled.'
              : 'Free plan includes 20 watchlist slots, 30-day history, and one base-price alert per set.'}
        </Text>
        <View className="self-start">
          <AppButton
            size="sm"
            onPress={() => router.push({ pathname: '/modal/paywall', params: { reason: 'settings_plan' } })}
          >
            {plan.data?.isPremium ? 'Manage Premium' : 'Upgrade to Premium'}
          </AppButton>
        </View>
      </View>

      <View className="gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">About</Text>
        <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
          PriBrix tracks LEGO set prices for Belgium and the Netherlands using affiliate feeds and authorized APIs.
        </Text>
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">{legoDisclaimer}</Text>
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">App version: {versionLabel}</Text>
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
          Scope: internal beta · phone-only · premium via manual entitlements
        </Text>
      </View>

      {environment !== 'prod' ? (
        <View className="gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Beta ops</Text>
          <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            EAS project {easProjectId ? 'linked' : 'missing'} · Sentry {sentryConfigured ? 'configured' : 'missing env'}
          </Text>
          <AppButton
            size="sm"
            variant={sentryConfigured ? 'primary' : 'secondary'}
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
            Send Sentry test event
          </AppButton>
        </View>
      ) : null}

      <View className="gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Legal</Text>
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
        <View className="gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
          <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Account</Text>
          <SettingsLinkRow
            label="Delete account"
            description="Permanently remove your synced data, push tokens, and PriBrix account."
            destructive
            onPress={() => router.push('/settings/delete-account')}
          />
        </View>
      ) : null}

      {user ? (
        <AppButton
          variant="dark"
          fullWidth
          onPress={() => {
            void signOut().then(() => {
              router.replace('/');
            });
          }}
        >
          Sign out
        </AppButton>
      ) : (
        <AppButton fullWidth onPress={() => router.push('/auth/sign-in')}>
          Sign in to sync lists
        </AppButton>
      )}
    </ScrollView>
  );
}
