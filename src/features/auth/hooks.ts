import { useMemo } from 'react';

import { useSession } from '@/src/lib/auth/session';

import { signInWithMagicLink, signOut } from './api';

export function useAuth() {
  const sessionState = useSession();

  return useMemo(
    () => ({
      session: sessionState.session,
      user: sessionState.user,
      isLoading: sessionState.isLoading,
      isMigrating: sessionState.isMigrating,
      signIn: signInWithMagicLink,
      signOut,
    }),
    [sessionState],
  );
}
