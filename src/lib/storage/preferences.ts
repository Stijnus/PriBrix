import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import { storageKeys } from '@/src/lib/storage/keys';
import { CountryCodeSchema, type CountryCode } from '@/src/types/app';

export const PreferencesSchema = z.object({
  country: CountryCodeSchema,
  showDeliveredPrice: z.boolean(),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

function getDefaultCountry(): CountryCode {
  return process.env.EXPO_PUBLIC_DEFAULT_COUNTRY === 'NL' ? 'NL' : 'BE';
}

export const defaultPreferences: Preferences = {
  country: getDefaultCountry(),
  showDeliveredPrice: true,
};

export async function getPreferences(): Promise<Preferences> {
  const raw = await AsyncStorage.getItem(storageKeys.userPreferences);

  if (!raw) {
    return defaultPreferences;
  }

  try {
    return PreferencesSchema.parse(JSON.parse(raw));
  } catch {
    return defaultPreferences;
  }
}

export async function setPreferences(preferences: Preferences) {
  const value = PreferencesSchema.parse(preferences);
  await AsyncStorage.setItem(storageKeys.userPreferences, JSON.stringify(value));
}
