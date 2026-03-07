import { FlatList, Text, View } from 'react-native';
import { router } from 'expo-router';

import { EmptyState } from '@/src/components/ui/EmptyState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { useAuth } from '@/src/features/auth/hooks';
import { AlertEventRow } from '@/src/features/alerts/components/AlertEventRow';
import { useAlertEvents } from '@/src/features/alerts/hooks';

export default function AlertsScreen() {
  const { user } = useAuth();
  const { items, isLoading, isRefetching, refetch } = useAlertEvents(Boolean(user));

  if (!user) {
    return (
      <View className="flex-1 gap-6 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Alerts</Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Sign in to receive push notifications and see alert history.
          </Text>
        </View>
        <EmptyState
          title="Alerts need an account"
          description="Create an account to sync your watchlist and receive price-drop notifications."
          actionLabel="Sign in"
          onAction={() => router.push('/auth/sign-in')}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 gap-6 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Alerts</Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Recent price-drop events from your watchlist.
          </Text>
        </View>
        <LoadingSkeleton count={4} compact />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50 dark:bg-neutral-900"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 12 }}
      data={items}
      keyExtractor={(item) => item.id}
      onRefresh={() => void refetch()}
      refreshing={isRefetching}
      renderItem={({ item }) => (
        <AlertEventRow item={item} onPress={() => router.push(`/set/${item.set_num}`)} />
      )}
      ListHeaderComponent={
        <View className="gap-2 pb-2">
          <Text className="text-2xl font-bold text-neutral-700 dark:text-neutral-100">Alerts</Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Recent price-drop events from your watchlist.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title="No alerts triggered yet"
          description="Set a target price on your watchlist items and PriBrix will log alerts here after ingestion runs."
        />
      }
    />
  );
}
