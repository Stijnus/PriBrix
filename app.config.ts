import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'PriBrix',
  slug: 'pribrix',
  scheme: 'pribrix',
  version: '1.0.0',
  runtimeVersion: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  icon: './assets/images/icon.png',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FFF5F6',
    dark: {
      image: './assets/images/splash-icon.png',
      backgroundColor: '#111318',
    },
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.pribrix.app',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.pribrix.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FFF5F6',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router', 'expo-notifications', '@sentry/react-native', 'sentry-expo'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    env: process.env.EXPO_PUBLIC_ENV,
    defaultCountry: process.env.EXPO_PUBLIC_DEFAULT_COUNTRY,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    eas: {
      projectId: 'a511e2fa-f536-4528-a5d3-86b09d6c4a47',
    },
  },
};

export default config;
