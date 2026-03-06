import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider } from '@/src/lib/auth/session';
import { queryClient } from '@/src/lib/queryClient';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#F8FAFC',
              },
            }}
          >
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
