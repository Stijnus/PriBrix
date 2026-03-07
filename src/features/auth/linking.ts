import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const APP_SCHEME = 'pribrix://';
const AUTH_CALLBACK_PATH = '/auth/verify' as const;
const AUTH_CALLBACK_ROUTE = 'auth/verify';

const AUTH_PARAM_KEYS = [
  'access_token',
  'refresh_token',
  'token_hash',
  'type',
  'code',
  'error',
  'error_description',
] as const;

export type MagicLinkCallbackParams = Partial<Record<(typeof AUTH_PARAM_KEYS)[number], string>>;

function normalizeParamValue(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeParamValue(value[0]);
  }

  if (typeof value === 'string') {
    return value.length > 0 ? value : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

function readParams(raw: string | null | undefined) {
  const params: MagicLinkCallbackParams = {};

  if (!raw) {
    return params;
  }

  const searchParams = new URLSearchParams(raw.replace(/^[?#]/, ''));

  for (const key of AUTH_PARAM_KEYS) {
    const value = searchParams.get(key);

    if (value) {
      params[key] = value;
    }
  }

  return params;
}

function getRouteFromUrl(url: string) {
  if (url.startsWith(APP_SCHEME)) {
    return url.slice(APP_SCHEME.length).split(/[?#]/, 1)[0]?.replace(/^\/+|\/+$/g, '') ?? '';
  }

  const parsed = Linking.parse(url);
  return parsed.path?.replace(/^\/+|\/+$/g, '') ?? '';
}

export function getMagicLinkRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/verify`;
  }
  // Native: always use the canonical scheme (double slash, no leading slash in path)
  // Expo Go does NOT support custom schemes; a dev build is required for magic links
  return `${APP_SCHEME}${AUTH_CALLBACK_ROUTE}`; // 'pribrix://auth/verify'
}

export function getMagicLinkCallbackRoute(url: string) {
  const parsed = Linking.parse(url);
  const route = getRouteFromUrl(url);
  const queryParams = Object.fromEntries(
    AUTH_PARAM_KEYS.map((key) => [key, normalizeParamValue(parsed.queryParams?.[key])]),
  ) as MagicLinkCallbackParams;
  const fragmentParams = readParams(url.split('#')[1]);
  const params = {
    ...queryParams,
    ...fragmentParams,
  };
  const hasAuthParams = Object.values(params).some((value) => typeof value === 'string' && value.length > 0);

  if (!hasAuthParams) {
    return null;
  }

  if (route !== '' && route !== AUTH_CALLBACK_ROUTE) {
    return null;
  }

  return {
    pathname: AUTH_CALLBACK_PATH,
    params,
  };
}
