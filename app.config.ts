import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'PriBrix',
  slug: 'pribrix',
  scheme: 'pribrix',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  icon: './assets/images/icon.png',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FFF8F0',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.pribrix.app',
  },
  android: {
    package: 'com.pribrix.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FFF8F0',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    env: process.env.EXPO_PUBLIC_ENV,
    defaultCountry: process.env.EXPO_PUBLIC_DEFAULT_COUNTRY,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
};

export default config;
