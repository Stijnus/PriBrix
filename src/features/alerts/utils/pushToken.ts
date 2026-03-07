import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { storageKeys } from '@/src/lib/storage/keys';

export type PushRegistration = {
  token: string;
  platform: 'ios' | 'android';
};

function getPlatform(): PushRegistration['platform'] {
  return Platform.OS === 'android' ? 'android' : 'ios';
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
  if (Platform.OS === 'web') {
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

  const subscription = Notifications.addPushTokenListener((token) => {
    void storePushToken(token.data);
    onToken({
      token: token.data,
      platform: getPlatform(),
    });
  });

  return () => {
    subscription.remove();
  };
}
