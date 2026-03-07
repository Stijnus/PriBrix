import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { completeMagicLinkSignIn, signInWithMagicLink } from '@/src/features/auth/api';
import { useAuth } from '@/src/features/auth/hooks';
import { getPendingAuthEmail } from '@/src/lib/storage/authState';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function getFriendlyError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('expired') || normalized.includes('invalid')) {
    return 'This link has expired. Request a new one.';
  }

  return message;
}

export default function VerifyScreen() {
  const params = useLocalSearchParams<{
    email?: string;
    access_token?: string;
    refresh_token?: string;
    token_hash?: string;
    type?: string;
    code?: string;
    error_description?: string;
  }>();
  const [email, setEmail] = useState(getParam(params.email));
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const accessToken = getParam(params.access_token);
  const refreshToken = getParam(params.refresh_token);
  const tokenHash = getParam(params.token_hash);
  const authCode = getParam(params.code);
  const authType = getParam(params.type);
  const errorDescription = getParam(params.error_description);
  const hasCallbackParams = Boolean(accessToken || refreshToken || tokenHash || authCode || errorDescription);

  useEffect(() => {
    if (email.length > 0) {
      return;
    }

    let isCancelled = false;

    getPendingAuthEmail().then((pendingEmail) => {
      if (!isCancelled && pendingEmail) {
        setEmail(pendingEmail);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [email.length]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  useEffect(() => {
    if (user) {
      router.replace('/my-lego');
    }
  }, [user]);

  useEffect(() => {
    if (!hasCallbackParams) {
      return;
    }

    let isCancelled = false;

    async function verify() {
      if (errorDescription) {
        setStatus('error');
        setError(getFriendlyError(decodeURIComponent(errorDescription)));
        return;
      }

      setStatus('verifying');
      setError(null);

      try {
        await completeMagicLinkSignIn({
          accessToken,
          refreshToken,
          tokenHash,
          type: authType,
          code: authCode,
        });

        if (!isCancelled) {
          setStatus('success');
          router.replace('/my-lego');
        }
      } catch (verificationError) {
        if (!isCancelled) {
          setStatus('error');
          setError(
            getFriendlyError(
              verificationError instanceof Error ? verificationError.message : 'Could not verify this magic link.',
            ),
          );
        }
      }
    }

    void verify();

    return () => {
      isCancelled = true;
    };
  }, [accessToken, authCode, authType, errorDescription, hasCallbackParams, refreshToken, tokenHash]);

  const helperText = useMemo(() => {
    if (status === 'verifying') {
      return 'Verifying your sign-in link…';
    }

    if (status === 'success') {
      return 'Sign-in complete. Redirecting back to PriBrix…';
    }

    if (status === 'error') {
      return error ?? 'This sign-in link could not be completed.';
    }

    return 'Check your inbox and open the email on this device to finish signing in.';
  }, [error, status]);

  async function handleResend() {
    if (!email || secondsRemaining > 0) {
      return;
    }

    setStatus('waiting');
    setError(null);
    setSecondsRemaining(60);

    try {
      await signInWithMagicLink(email);
    } catch (resendError) {
      setStatus('error');
      setError(resendError instanceof Error ? resendError.message : 'Could not resend the magic link.');
    }
  }

  return (
    <View className="flex-1 gap-6 bg-neutral-50 px-4 py-6 dark:bg-neutral-900">
      <View className="gap-2">
        <Text className="text-3xl font-bold text-neutral-700 dark:text-neutral-100">Verify sign-in</Text>
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          {email ? `Magic link sent to ${email}.` : 'Magic link sent to your email.'}
        </Text>
      </View>

      <View className="gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <Text
          className={`text-base ${
            status === 'error' ? 'text-error' : 'text-neutral-600 dark:text-neutral-300'
          }`}
        >
          {helperText}
        </Text>

        <Pressable
          className={`items-center rounded-lg px-5 py-3 ${
            secondsRemaining > 0 ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-primary-600'
          }`}
          disabled={secondsRemaining > 0}
          onPress={() => void handleResend()}
        >
          <Text
            className={`text-base font-semibold ${
              secondsRemaining > 0 ? 'text-neutral-500 dark:text-neutral-300' : 'text-white'
            }`}
          >
            {secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : 'Resend magic link'}
          </Text>
        </Pressable>
      </View>

      <Pressable className="self-start rounded-lg bg-white px-4 py-2 dark:bg-neutral-800" onPress={() => router.replace('/auth/sign-in')}>
        <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Use another email</Text>
      </Pressable>
    </View>
  );
}
