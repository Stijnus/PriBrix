import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { PremiumBadge } from '@/src/features/premium/components/PremiumBadge';
import {
  getPaywallLinks,
  initiateCheckout,
  openPrivacyPolicy,
  openTermsOfService,
} from '@/src/features/premium/api';
import { useUserPlan } from '@/src/features/premium/hooks';
import { trackPaywallViewed, trackPremiumStarted } from '@/src/lib/analytics/events';

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
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="gap-6 px-4 py-6">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <PremiumBadge interactive={false} />
          <Text className="text-3xl font-bold text-neutral-700 dark:text-neutral-100">PriBrix Premium</Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Unlock more history, more alerts, and more watch slots.
          </Text>
        </View>
        <Pressable className="rounded-lg bg-white px-4 py-2 dark:bg-neutral-800" onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Not now</Text>
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

      <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        {premiumFeatures.map((feature) => (
          <View key={feature} className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
            <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">{feature}</Text>
          </View>
        ))}
      </View>

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-xl bg-primary-50 p-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Monthly</Text>
            <Text className="mt-1 text-3xl font-bold text-neutral-800 dark:text-neutral-50">EUR 2.99</Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">per month</Text>
          </View>
          <View className="flex-1 rounded-xl bg-accent-50 p-4">
            <Text className="text-sm font-semibold uppercase tracking-wide text-accent-700">Yearly</Text>
            <Text className="mt-1 text-3xl font-bold text-neutral-800 dark:text-neutral-50">EUR 19</Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">per year</Text>
          </View>
        </View>

        <Pressable className="items-center rounded-lg bg-primary-600 px-5 py-3" onPress={() => void handleCheckout()}>
          <Text className="text-base font-semibold text-white">
            {links.checkout ? 'Start Free Trial / Subscribe' : 'Request Premium Access'}
          </Text>
        </Pressable>

        <Pressable
          className="items-center rounded-lg bg-neutral-100 px-5 py-3 dark:bg-neutral-700"
          onPress={() =>
            Alert.alert(
              'Restore purchase',
              'This beta build uses manual entitlements. If your plan was set server-side, reopening the app will refresh it.',
            )
          }
        >
          <Text className="text-base font-semibold text-neutral-700 dark:text-neutral-100">Restore Purchase</Text>
        </Pressable>
      </View>

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          Premium billing is a stub in this phase. Beta users can also be upgraded manually through `user_plans`.
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <Text className="text-sm font-semibold text-accent-700" onPress={() => void openTermsOfService()}>
            Terms of service
          </Text>
          <Text className="text-sm font-semibold text-accent-700" onPress={() => void openPrivacyPolicy()}>
            Privacy policy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
