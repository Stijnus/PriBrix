import * as Sentry from '@sentry/react-native';

type AnalyticsEventProperties = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsEventName =
  | 'search_performed'
  | 'set_viewed'
  | 'affiliate_click'
  | 'watch_added'
  | 'alert_created'
  | 'alert_triggered'
  | 'paywall_viewed'
  | 'premium_started'
  | 'list_migration_completed';

let currentUserId: string | null = null;

function logDevEvent(action: 'track' | 'identify' | 'reset', payload: unknown) {
  if (__DEV__) {
    console.log(`[analytics:${action}]`, payload);
  }
}

export function identify(userId: string) {
  currentUserId = userId;
  Sentry.setUser({ id: userId });
  logDevEvent('identify', { userId });
}

export function reset() {
  currentUserId = null;
  Sentry.setUser(null);
  logDevEvent('reset', {});
}

export function track(event: AnalyticsEventName, properties: AnalyticsEventProperties = {}) {
  logDevEvent('track', {
    event,
    userId: currentUserId,
    properties,
  });
}
