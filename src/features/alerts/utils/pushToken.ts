import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { storageKeys } from '@/src/lib/storage/keys';

export type PushRegistration = {
  token: string;
  platform: 'ios' | 'android';
};

let notificationsModulePromise: Promise<typeof import('expo-notifications') | null> | null = null;

function getPlatform(): PushRegistration['platform'] {
  return Platform.OS === 'android' ? 'android' : 'ios';
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

export async function getStoredPushToken() {
  return AsyncStorage.getItem(storageKeys.pushToken);
}

export async function clearStoredPushToken() {
  await AsyncStorage.removeItem(storageKeys.pushToken);
}

async function storePushToken(token: string) {
  await AsyncStorage.setItem(storageKeys.pushToken, token);
}

export async function requestPushToken(): Promise<PushRegistration | null> {
  const Notifications = await loadNotificationsModule();

  if (!Notifications) {
    return null;
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermissions.status;

  if (finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('price-alerts', {
      name: 'Price alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined;
  const pushTokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  await storePushToken(pushTokenResponse.data);

  return {
    token: pushTokenResponse.data,
    platform: getPlatform(),
  };
}

export function listenForPushTokenChanges(
  onToken: (registration: PushRegistration) => void,
) {
  if (Platform.OS === 'web') {
    return () => {};
  }

  let isCancelled = false;
  let removeSubscription = () => {};

  void loadNotificationsModule()
    .then((Notifications) => {
      if (!Notifications || isCancelled) {
        return;
      }

      const subscription = Notifications.addPushTokenListener((token) => {
        void storePushToken(token.data);
        onToken({
          token: token.data,
          platform: getPlatform(),
        });
      });

      removeSubscription = () => {
        subscription.remove();
      };
    })
    .catch((error) => {
      if (!isCancelled) {
        console.warn('Could not listen for push token changes.', error);
      }
    });

  return () => {
    isCancelled = true;
    removeSubscription();
  };
}
