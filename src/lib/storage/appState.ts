import AsyncStorage from '@react-native-async-storage/async-storage';

import { storageKeys } from '@/src/lib/storage/keys';

function getMigrationKey(userId: string) {
  return `${storageKeys.migrationCompletedPrefix}:${userId}`;
}

export async function clearAppStorage(userId?: string) {
  const keys: string[] = [
    storageKeys.localWatchlist,
    storageKeys.localWishlist,
    storageKeys.localOwned,
    storageKeys.userPreferences,
    storageKeys.pendingAuthEmail,
    storageKeys.pushToken,
  ];

  if (userId) {
    keys.push(getMigrationKey(userId));
  }

  await AsyncStorage.multiRemove(keys);
}
