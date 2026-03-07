import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import {
  DMMono_500Medium,
} from '@expo-google-fonts/dm-mono';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getMagicLinkCallbackRoute } from '@/src/features/auth/linking';
import { SessionProvider } from '@/src/lib/auth/session';
import { initSentry } from '@/src/lib/monitoring/sentry';
import { queryClient } from '@/src/lib/queryClient';
import { theme } from '@/src/theme';

initSentry();
void SplashScreen.preventAutoHideAsync();

let defaultsApplied = false;
let notificationHandlerConfigured = false;
let notificationsModulePromise: Promise<typeof import('expo-notifications') | null> | null = null;

function applyTypographyDefaults() {
  if (defaultsApplied) {
    return;
  }

  const textComponent = Text as typeof Text & { defaultProps?: { style?: unknown } };
  const textInputComponent = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
  const textStyle = { fontFamily: theme.typography.fontFamily };

  textComponent.defaultProps = {
    ...textComponent.defaultProps,
    style: textComponent.defaultProps?.style ? [textStyle, textComponent.defaultProps.style] : textStyle,
  };
  textInputComponent.defaultProps = {
    ...textInputComponent.defaultProps,
    style: textInputComponent.defaultProps?.style
      ? [textStyle, textInputComponent.defaultProps.style]
      : textStyle,
  };

  defaultsApplied = true;
}

async function loadNotificationsModule() {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications');
  }

  return notificationsModulePromise;
}

async function ensureNotificationHandler() {
  const Notifications = await loadNotificationsModule();

  if (!Notifications || notificationHandlerConfigured) {
    return Notifications;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationHandlerConfigured = true;
  return Notifications;
}

function NotificationNavigation() {
  const router = useRouter();
  const lastNotificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    function handleResponse(response: import('expo-notifications').NotificationResponse | null) {
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

    let isCancelled = false;
    let removeSubscription = () => {};

    async function setupNotifications() {
      const Notifications = await ensureNotificationHandler();

      if (!Notifications || isCancelled) {
        return;
      }

      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        handleResponse(response);
      });

      removeSubscription = () => {
        subscription.remove();
      };

      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!isCancelled) {
          handleResponse(response);
        }
      });
    }

    void setupNotifications();

    return () => {
      isCancelled = true;
      removeSubscription();
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
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
    DMMono_500Medium,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    applyTypographyDefaults();
    void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
                  backgroundColor: theme.colors.bgApp,
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
