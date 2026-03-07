import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { PremiumBadge } from '@/src/features/premium/components/PremiumBadge';
import {
  getPaywallLinks,
  initiateCheckout,
  openPrivacyPolicy,
  openTermsOfService,
} from '@/src/features/premium/api';
import { useUserPlan } from '@/src/features/premium/hooks';
import { trackPaywallViewed, trackPremiumStarted } from '@/src/lib/analytics/events';
import { theme } from '@/src/theme';

const premiumFeatures = [
  'Unlimited watchlist',
  '365-day price history',
  'Advanced alerts for delivered price, 30d drops, and 90d lows',
] as const;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function PaywallModal() {
  const plan = useUserPlan();
  const links = getPaywallLinks();
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = getParam(params.reason) || 'unspecified';

  useEffect(() => {
    trackPaywallViewed(reason);
  }, [reason]);

  async function handleCheckout() {
    try {
      trackPremiumStarted(links.checkout ? 'checkout_url' : 'manual_beta');
      await initiateCheckout();
    } catch (error) {
      Alert.alert(
        'Premium checkout unavailable',
        error instanceof Error ? error.message : 'This beta build uses manual entitlements.',
      );
    }
  }

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <PremiumBadge interactive={false} />
          <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">PriBrix Premium</Text>
          <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
            Unlock more history, more alerts, and more watch slots.
          </Text>
        </View>
        <Pressable className="h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-neutral-800" onPress={() => router.back()}>
          <ChevronLeft color={theme.colors.neutral[700]} size={20} strokeWidth={2} />
        </Pressable>
      </View>

      {plan.data?.isExpired ? (
        <View className="rounded-xl bg-warning-light p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-warning">Premium expired</Text>
          <Text className="mt-1 text-sm text-neutral-700">
            Your previous premium period ended. Renew to restore unlimited watchlist and premium alerts.
          </Text>
        </View>
      ) : null}

      {plan.data?.isPastDue ? (
        <View className="rounded-xl bg-warning-light p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-warning">Payment issue</Text>
          <Text className="mt-1 text-sm text-neutral-700">
            Your subscription is in a grace period. Update your payment method to keep premium access.
          </Text>
        </View>
      ) : null}

      <View className="gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        {premiumFeatures.map((feature) => (
          <View key={feature} className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
            <Text className="font-sans-semibold text-base text-neutral-700 dark:text-neutral-100">{feature}</Text>
          </View>
        ))}
      </View>

      <View className="gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-xl bg-primary-50 p-4">
            <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Monthly</Text>
            <Text className="mt-1 font-mono text-3xl text-neutral-900 dark:text-neutral-50">€2.99</Text>
            <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">per month</Text>
          </View>
          <View className="flex-1 rounded-xl bg-accent-50 p-4">
            <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-accent-700">Yearly</Text>
            <Text className="mt-1 font-mono text-3xl text-neutral-900 dark:text-neutral-50">€19.00</Text>
            <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">per year</Text>
          </View>
        </View>

        <AppButton fullWidth onPress={() => void handleCheckout()}>
          {links.checkout ? 'Start Free Trial / Subscribe' : 'Request Premium Access'}
        </AppButton>

        <AppButton
          fullWidth
          variant="secondary"
          onPress={() =>
            Alert.alert(
              'Restore purchase',
              'This beta build uses manual entitlements. If your plan was set server-side, reopening the app will refresh it.',
            )
          }
        >
          Restore Purchase
        </AppButton>
      </View>

      <View className="gap-3 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <Text className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
          Premium billing is a stub in this phase. Beta users can also be upgraded manually through `user_plans`.
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <Text className="font-sans-semibold text-sm text-accent-700" onPress={() => void openTermsOfService()}>
            Terms of service
          </Text>
          <Text className="font-sans-semibold text-sm text-accent-700" onPress={() => void openPrivacyPolicy()}>
            Privacy policy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
