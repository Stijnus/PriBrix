import { track } from '@/src/lib/analytics/tracker';

import type { AlertType } from '@/src/features/alerts/types';

export function trackSearchPerformed(query: string, resultsCount: number) {
  track('search_performed', {
    query,
    results_count: resultsCount,
  });
}

export function trackSetViewed(setNum: string) {
  track('set_viewed', {
    set_num: setNum,
  });
}

export function trackAffiliateClick(setNum: string, retailer: string, price: number | null) {
  track('affiliate_click', {
    set_num: setNum,
    retailer,
    price,
  });
}

export function trackWatchAdded(setNum: string, country: string) {
  track('watch_added', {
    set_num: setNum,
    country,
  });
}

export function trackAlertCreated(
  setNum: string,
  type: AlertType,
  threshold: number | null,
) {
  track('alert_created', {
    set_num: setNum,
    type,
    threshold,
  });
}

export function trackPaywallViewed(reason: string) {
  track('paywall_viewed', {
    reason,
  });
}

export function trackPremiumStarted(planType: string) {
  track('premium_started', {
    plan_type: planType,
  });
}

export function trackListMigrationCompleted(counts: {
  watchlist: number;
  wishlist: number;
  owned: number;
}) {
  track('list_migration_completed', {
    watchlist_count: counts.watchlist,
    wishlist_count: counts.wishlist,
    owned_count: counts.owned,
  });
}
