import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getMagicLinkCallbackRoute } from '@/src/features/auth/linking';
import { SessionProvider } from '@/src/lib/auth/session';
import { initSentry } from '@/src/lib/monitoring/sentry';
import { queryClient } from '@/src/lib/queryClient';
import { colors } from '@/src/theme/colors';

initSentry();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function NotificationNavigation() {
  const router = useRouter();
  const lastNotificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    function handleResponse(response: Notifications.NotificationResponse | null) {
      if (!response) {
        return;
      }

      const notificationId = response.notification.request.identifier;

      if (lastNotificationIdRef.current === notificationId) {
        return;
      }

      lastNotificationIdRef.current = notificationId;

      const payload = response.notification.request.content.data;
      const setNumValue =
        typeof payload?.setNum === 'string'
          ? payload.setNum
          : typeof payload?.set_num === 'string'
            ? payload.set_num
            : null;

      if (setNumValue) {
        router.push(`/set/${setNumValue}`);
      }
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleResponse(response);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      handleResponse(response);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}

function AuthCallbackNavigation() {
  const router = useRouter();
  const lastHandledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    function handleUrl(url: string | null) {
      if (!url || lastHandledUrlRef.current === url) {
        return;
      }

      const callbackRoute = getMagicLinkCallbackRoute(url);

      if (!callbackRoute) {
        return;
      }

      lastHandledUrlRef.current = url;
      router.replace(callbackRoute);
    }

    void Linking.getInitialURL().then((url) => {
      handleUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  return (
    <Sentry.ErrorBoundary fallback={<StatusBar style="auto" />}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <AuthCallbackNavigation />
            <NotificationNavigation />
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: colors.neutral[50],
                },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth/sign-in" />
              <Stack.Screen name="auth/verify" />
              <Stack.Screen name="set/[setNum]" />
              <Stack.Screen name="settings/privacy-policy" />
              <Stack.Screen name="settings/terms" />
              <Stack.Screen name="settings/affiliate-disclosure" />
              <Stack.Screen name="settings/delete-account" />
              <Stack.Screen name="modal/add-to-list" options={{ presentation: 'modal' }} />
              <Stack.Screen name="modal/paywall" options={{ presentation: 'modal' }} />
            </Stack>
          </SessionProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </Sentry.ErrorBoundary>
  );
}
