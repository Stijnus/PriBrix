import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-900">
        <Text className="mb-2 text-2xl font-bold text-neutral-700 dark:text-neutral-100">
          Route not found
        </Text>
        <Text className="mb-6 text-center text-base text-neutral-500 dark:text-neutral-400">
          PriBrix is scaffolded, but this route does not exist yet.
        </Text>
        <Link href="/" className="rounded-lg bg-primary-600 px-5 py-3 text-base font-semibold text-white">
          Return home
        </Link>
      </View>
    </>
  );
}
