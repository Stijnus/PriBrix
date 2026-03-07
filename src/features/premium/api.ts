import * as WebBrowser from 'expo-web-browser';
import { z } from 'zod';

import { supabase } from '@/src/lib/supabase/client';

import type { UserPlan } from './types';

const UserPlanRowSchema = z.object({
  user_id: z.string().uuid(),
  plan: z.enum(['free', 'premium']),
  status: z.enum(['active', 'past_due', 'canceled']),
  provider: z.string().nullable().optional(),
  current_period_end: z.string().datetime().nullable().optional(),
});

const paywallUrls = {
  checkout: process.env.EXPO_PUBLIC_PREMIUM_CHECKOUT_URL ?? '',
  terms: process.env.EXPO_PUBLIC_TERMS_URL ?? 'https://pribrix.app/terms',
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? 'https://pribrix.app/privacy',
} as const;

function hasPremiumAccess(plan: {
  plan: 'free' | 'premium';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: string | null;
}) {
  if (plan.plan !== 'premium') {
    return false;
  }

  if (plan.status === 'active' || plan.status === 'past_due') {
    return true;
  }

  if (!plan.currentPeriodEnd) {
    return false;
  }

  return new Date(plan.currentPeriodEnd).getTime() > Date.now();
}

function normalizePlan(row: z.infer<typeof UserPlanRowSchema> | null, userId?: string): UserPlan {
  if (!row) {
    return {
      userId: userId ?? null,
      plan: 'free',
      status: 'active',
      provider: null,
      currentPeriodEnd: null,
      resolvedPlan: 'free',
      isPremium: false,
      isExpired: false,
      isPastDue: false,
    };
  }

  const currentPeriodEnd = row.current_period_end ?? null;
  const isPremium = hasPremiumAccess({
    plan: row.plan,
    status: row.status,
    currentPeriodEnd,
  });
  const isExpired =
    row.plan === 'premium' &&
    row.status !== 'active' &&
    currentPeriodEnd != null &&
    new Date(currentPeriodEnd).getTime() <= Date.now();

  return {
    userId: row.user_id,
    plan: row.plan,
    status: row.status,
    provider: row.provider ?? null,
    currentPeriodEnd,
    resolvedPlan: isPremium ? 'premium' : 'free',
    isPremium,
    isExpired,
    isPastDue: row.plan === 'premium' && row.status === 'past_due',
  };
}

export async function fetchUserPlan(userId?: string): Promise<UserPlan> {
  if (!userId) {
    return normalizePlan(null);
  }

  const { data, error } = await supabase
    .from('user_plans')
    .select('user_id,plan,status,provider,current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return normalizePlan(data ? UserPlanRowSchema.parse(data) : null, userId);
}

export async function initiateCheckout() {
  if (!paywallUrls.checkout) {
    throw new Error('Premium checkout is not configured yet. Beta entitlements are managed manually.');
  }

  await WebBrowser.openBrowserAsync(paywallUrls.checkout);
}

export async function openTermsOfService() {
  await WebBrowser.openBrowserAsync(paywallUrls.terms);
}

export async function openPrivacyPolicy() {
  await WebBrowser.openBrowserAsync(paywallUrls.privacy);
}

export function getPaywallLinks() {
  return paywallUrls;
}
