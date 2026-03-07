import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
let initialized = false;

export function isSentryConfigured() {
  return sentryDsn.length > 0;
}

export function initSentry() {
  if (initialized || !sentryDsn) {
    return;
  }

  const release = `pribrix@${Constants.expoConfig?.version ?? '1.0.0'}`;
  const dist = String(Constants.nativeBuildVersion ?? 'dev');

  Sentry.init({
    dsn: sentryDsn,
    enabled: true,
    release,
    dist,
    tracesSampleRate: __DEV__ ? 1 : 0.2,
    profilesSampleRate: 0,
    debug: __DEV__,
  });

  initialized = true;
}

export function captureSentryTestEvent() {
  if (!isSentryConfigured()) {
    return false;
  }

  const release = `pribrix@${Constants.expoConfig?.version ?? '1.0.0'}`;

  Sentry.captureException(
    new Error(`PriBrix Sentry test event (${release})`),
    {
      tags: {
        source: 'settings',
        environment: process.env.EXPO_PUBLIC_ENV ?? 'dev',
      },
      level: 'info',
    },
  );

  return true;
}
