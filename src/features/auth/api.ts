import { type EmailOtpType, type Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { clearPendingAuthEmail, setPendingAuthEmail } from '@/src/lib/storage/authState';
import { supabase } from '@/src/lib/supabase/client';

function getRedirectUrl() {
  return Linking.createURL('/auth/verify');
}

export async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectUrl(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  await setPendingAuthEmail(email);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

type CompleteMagicLinkInput = {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  tokenHash?: string;
  type?: string;
};

export async function completeMagicLinkSignIn({
  accessToken,
  refreshToken,
  code,
  tokenHash,
  type,
}: CompleteMagicLinkInput): Promise<Session | null> {
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    await clearPendingAuthEmail();
    return data.session;
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new Error(error.message);
    }

    await clearPendingAuthEmail();
    return data.session;
  }

  if (tokenHash) {
    const otpType = (type ?? 'magiclink') as EmailOtpType;
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });

    if (error) {
      throw new Error(error.message);
    }

    await clearPendingAuthEmail();
    return data.session;
  }

  return null;
}
