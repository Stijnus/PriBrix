import { FlatList, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/ui/EmptyState';
import { LoadingSkeleton } from '@/src/components/ui/LoadingSkeleton';
import { useAuth } from '@/src/features/auth/hooks';
import { AlertEventRow } from '@/src/features/alerts/components/AlertEventRow';
import { useAlertEvents } from '@/src/features/alerts/hooks';

function AlertsHeader() {
  return (
    <View className="gap-2">
      <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Alerts</Text>
      <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">Alert history</Text>
      <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
        Recent price-drop events from your watchlist.
      </Text>
    </View>
  );
}

export default function AlertsScreen() {
  const { user } = useAuth();
  const { items, isLoading, isRefetching, refetch } = useAlertEvents(Boolean(user));
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 24;

  if (!user) {
    return (
      <View
        className="flex-1 gap-6 bg-neutral-100 px-4 dark:bg-neutral-900"
        style={{ paddingTop: topPadding }}
      >
        <View className="gap-2">
          <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Alerts</Text>
          <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">Alert history</Text>
          <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
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
      <View
        className="flex-1 gap-6 bg-neutral-100 px-4 dark:bg-neutral-900"
        style={{ paddingTop: topPadding }}
      >
        <AlertsHeader />
        <LoadingSkeleton count={4} compact />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-100 dark:bg-neutral-900"
      contentContainerStyle={{ paddingTop: topPadding, paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
      data={items}
      keyExtractor={(item) => item.id}
      onRefresh={() => void refetch()}
      refreshing={isRefetching}
      renderItem={({ item }) => (
        <AlertEventRow item={item} onPress={() => router.push(`/set/${item.set_num}`)} />
      )}
      ListHeaderComponent={<AlertsHeader />}
      ListEmptyComponent={
        <EmptyState
          title="No alerts triggered yet"
          description="Set a target price on your watchlist items and PriBrix will log alerts here after ingestion runs."
        />
      }
    />
  );
}
