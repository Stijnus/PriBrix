import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/src/lib/auth/session';
import { isClientRuntime } from '@/src/utils/runtime';

import { fetchUserPlan } from './api';
import {
  FREE_ALERTS_PER_SET,
  FREE_ALERT_TYPES,
  FREE_HISTORY_DAYS,
  FREE_WATCHLIST_LIMIT,
  PREMIUM_ALERT_TYPES,
  PREMIUM_HISTORY_DAYS,
} from './constants';

export function useUserPlan() {
  const clientRuntime = isClientRuntime();
  const { user } = useSession();

  return useQuery({
    queryKey: ['user-plan', user?.id],
    queryFn: () => fetchUserPlan(user?.id),
    enabled: clientRuntime,
  });
}

export function useIsPremium() {
  const plan = useUserPlan();

  return {
    ...plan,
    isPremium: plan.data?.isPremium ?? false,
  };
}

export function useEntitlements() {
  const plan = useUserPlan();

  const entitlements = useMemo(() => {
    if (plan.data?.isPremium) {
      return {
        watchlistLimit: null,
        historyDays: PREMIUM_HISTORY_DAYS,
        alertsPerSet: null,
        alertTypes: PREMIUM_ALERT_TYPES,
      } as const;
    }

    return {
      watchlistLimit: FREE_WATCHLIST_LIMIT,
      historyDays: FREE_HISTORY_DAYS,
      alertsPerSet: FREE_ALERTS_PER_SET,
      alertTypes: FREE_ALERT_TYPES,
    } as const;
  }, [plan.data?.isPremium]);

  return {
    ...plan,
    entitlements,
  };
}
