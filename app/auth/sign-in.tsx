import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { z } from 'zod';

import { useAuth } from '@/src/features/auth/hooks';
import { colors } from '@/src/theme/colors';

const emailSchema = z.string().trim().email('Enter a valid email address.');

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/my-lego');
    }
  }, [user]);

  async function handleSubmit() {
    const parsed = emailSchema.safeParse(email);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signIn(parsed.data);
      router.push({
        pathname: '/auth/verify',
        params: {
          email: parsed.data,
        },
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not send the magic link.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="flex-1 gap-6 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
      <View className="gap-2">
        <Text className="text-3xl font-bold text-neutral-700 dark:text-neutral-100">Sign in</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          Use a magic link to sync your lists and unlock alerts across devices.
        </Text>
      </View>

      <View className="gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          placeholderTextColor={colors.neutral[400]}
          className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        {error ? <Text className="text-sm font-medium text-error">{error}</Text> : null}
        <Pressable
          className="items-center rounded-lg bg-primary-600 px-5 py-3"
          disabled={isSubmitting}
          onPress={() => void handleSubmit()}
        >
          <Text className="text-base font-semibold text-white">
            {isSubmitting ? 'Sending magic link…' : 'Send magic link'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        className="rounded-xl bg-primary-50 p-4"
        onPress={() =>
          Alert.alert(
            'Why sign in?',
            'Signing in lets PriBrix sync your watchlist, wishlist, and collection across devices and prepares the app for alerts.',
          )
        }
      >
        <Text className="text-sm font-semibold uppercase tracking-wide text-primary-600">Why sign in?</Text>
        <Text className="mt-1 text-sm text-neutral-600">
          Sync lists, prepare alerts, and keep your data when you switch devices.
        </Text>
      </Pressable>

      <Pressable className="self-start rounded-lg bg-white px-4 py-2 dark:bg-neutral-800" onPress={() => router.back()}>
        <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Back</Text>
      </Pressable>
    </View>
  );
}
