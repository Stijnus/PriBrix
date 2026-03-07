import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';

import { AppButton } from '@/src/components/ui/AppButton';
import { useAuth } from '@/src/features/auth/hooks';
import { colors } from '@/src/theme/colors';
import { theme } from '@/src/theme';

const emailSchema = z.string().trim().email('Enter a valid email address.');

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn } = useAuth();
  const insets = useSafeAreaInsets();

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
    <View
      className="flex-1 gap-6 bg-neutral-100 px-4 dark:bg-neutral-900"
      style={{ paddingTop: insets.top + 24 }}
    >
      <View className="gap-2">
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Account</Text>
        <Text className="font-sans-extrabold text-3xl text-neutral-900 dark:text-white">Sign in</Text>
        <Text className="font-sans text-base text-neutral-600 dark:text-neutral-300">
          Use a magic link to sync your lists and unlock alerts across devices.
        </Text>
      </View>

      <View className="gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          placeholderTextColor={colors.neutral[400]}
          className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 font-sans text-base text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        {error ? <Text className="font-sans-medium text-sm text-error">{error}</Text> : null}
        <AppButton fullWidth disabled={isSubmitting} onPress={() => void handleSubmit()}>
          {isSubmitting ? 'Sending magic link…' : 'Send magic link'}
        </AppButton>
      </View>

      <Pressable
        className="rounded-xl border border-primary-100 bg-primary-50 p-5"
        onPress={() =>
          Alert.alert(
            'Why sign in?',
            'Signing in lets PriBrix sync your watchlist, wishlist, and collection across devices and prepares the app for alerts.',
          )
        }
      >
        <Text className="font-sans-semibold text-xs uppercase tracking-[1px] text-primary-500">Why sign in?</Text>
        <Text className="mt-1 font-sans text-sm text-neutral-600">
          Sync lists, prepare alerts, and keep your data when you switch devices.
        </Text>
      </Pressable>

      <Pressable className="h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-neutral-800" onPress={() => router.back()}>
        <ChevronLeft color={theme.colors.neutral[700]} size={20} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
