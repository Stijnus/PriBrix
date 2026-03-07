import AsyncStorage from '@react-native-async-storage/async-storage';

import { storageKeys } from '@/src/lib/storage/keys';

function getMigrationKey(userId: string) {
  return `${storageKeys.migrationCompletedPrefix}:${userId}`;
}

export async function getPendingAuthEmail() {
  return AsyncStorage.getItem(storageKeys.pendingAuthEmail);
}

export async function setPendingAuthEmail(email: string) {
  await AsyncStorage.setItem(storageKeys.pendingAuthEmail, email);
}

export async function clearPendingAuthEmail() {
  await AsyncStorage.removeItem(storageKeys.pendingAuthEmail);
}

export async function hasCompletedMigration(userId: string) {
  return (await AsyncStorage.getItem(getMigrationKey(userId))) === 'true';
}

export async function markMigrationCompleted(userId: string) {
  await AsyncStorage.setItem(getMigrationKey(userId), 'true');
}

export async function clearMigrationCompleted(userId: string) {
  await AsyncStorage.removeItem(getMigrationKey(userId));
}
