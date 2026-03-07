import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const fallbackSupabaseUrl = 'https://example.supabase.co';
const fallbackSupabaseAnonKey = 'public-anon-key-placeholder';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? fallbackSupabaseAnonKey;
const memoryStorage = new Map<string, string>();

const authStorage = {
  getItem(key: string) {
    if (Platform.OS !== 'web') {
      return AsyncStorage.getItem(key);
    }

    if (typeof window === 'undefined') {
      return Promise.resolve(memoryStorage.get(key) ?? null);
    }

    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    if (Platform.OS !== 'web') {
      return AsyncStorage.setItem(key, value);
    }

    if (typeof window === 'undefined') {
      memoryStorage.set(key, value);
      return Promise.resolve();
    }

    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    if (Platform.OS !== 'web') {
      return AsyncStorage.removeItem(key);
    }

    if (typeof window === 'undefined') {
      memoryStorage.delete(key);
      return Promise.resolve();
    }

    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export const hasSupabaseConfig =
  supabaseUrl !== fallbackSupabaseUrl && supabaseAnonKey !== fallbackSupabaseAnonKey;

if (__DEV__ && !hasSupabaseConfig) {
  console.warn(
    'Supabase env vars are missing. PriBrix is using placeholder credentials until EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are configured.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});
