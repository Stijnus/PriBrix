import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import {
  LocalOwnedItemArraySchema,
  LocalWatchItemArraySchema,
  LocalWishlistItemArraySchema,
  type LocalOwnedItem,
  type LocalWatchItem,
  type LocalWishlistItem,
} from '@/src/lib/validation/lists';
import { storageKeys } from '@/src/lib/storage/keys';

function parseStoredJson<T>(raw: string | null, schema: z.ZodType<T>, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getLocalWatchlist(): Promise<LocalWatchItem[]> {
  const raw = await AsyncStorage.getItem(storageKeys.localWatchlist);
  return parseStoredJson(raw, LocalWatchItemArraySchema, []);
}

export async function setLocalWatchlist(items: LocalWatchItem[]) {
  await writeJson(storageKeys.localWatchlist, LocalWatchItemArraySchema.parse(items));
}

export async function getLocalWishlist(): Promise<LocalWishlistItem[]> {
  const raw = await AsyncStorage.getItem(storageKeys.localWishlist);
  return parseStoredJson(raw, LocalWishlistItemArraySchema, []);
}

export async function setLocalWishlist(items: LocalWishlistItem[]) {
  await writeJson(storageKeys.localWishlist, LocalWishlistItemArraySchema.parse(items));
}

export async function getLocalOwned(): Promise<LocalOwnedItem[]> {
  const raw = await AsyncStorage.getItem(storageKeys.localOwned);
  return parseStoredJson(raw, LocalOwnedItemArraySchema, []);
}

export async function setLocalOwned(items: LocalOwnedItem[]) {
  await writeJson(storageKeys.localOwned, LocalOwnedItemArraySchema.parse(items));
}
