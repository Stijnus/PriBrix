import { type Session, type User } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { registerPushToken } from '@/src/features/alerts/api';
import { listenForPushTokenChanges, requestPushToken } from '@/src/features/alerts/utils/pushToken';
import {
  hasCompletedMigration,
} from '@/src/lib/storage/authState';
import { hasLocalListsToMigrate, migrateLocalLists } from '@/src/lib/migration/migrateLocalLists';
import { supabase } from '@/src/lib/supabase/client';

type SessionContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isMigrating: boolean;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  isLoading: true,
  isMigrating: false,
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const migratingUserRef = useRef<string | null>(null);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSession(null);
        setIsLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        setIsMigrating(false);
        migratingUserRef.current = null;
        void queryClient.invalidateQueries({ queryKey: ['server-watchlist'] });
        void queryClient.invalidateQueries({ queryKey: ['server-wishlist'] });
        void queryClient.invalidateQueries({ queryKey: ['server-owned'] });
        void queryClient.invalidateQueries({ queryKey: ['alert-events'] });
        void queryClient.invalidateQueries({ queryKey: ['alerts'] });
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    if (!userId) {
      setIsMigrating(false);
      migratingUserRef.current = null;
      return;
    }

    const activeUserId = userId;

    let isCancelled = false;

    async function runMigration() {
      const [alreadyCompleted, hasLocalData] = await Promise.all([
        hasCompletedMigration(activeUserId),
        hasLocalListsToMigrate(),
      ]);

      if (isCancelled || migratingUserRef.current === activeUserId || (!hasLocalData && alreadyCompleted)) {
        return;
      }

      if (!hasLocalData) {
        return;
      }

      migratingUserRef.current = activeUserId;
      setIsMigrating(true);

      try {
        const result = await migrateLocalLists(activeUserId);

        if (!isCancelled) {
          Alert.alert(
            'Lists synced',
            `Watchlist ${result.migratedWatchlistCount}, wishlist ${result.migratedWishlistCount}, collection ${result.migratedOwnedCount}.`,
          );
          void queryClient.invalidateQueries({ queryKey: ['local-watchlist'] });
          void queryClient.invalidateQueries({ queryKey: ['local-wishlist'] });
          void queryClient.invalidateQueries({ queryKey: ['local-owned'] });
          void queryClient.invalidateQueries({ queryKey: ['server-watchlist', activeUserId] });
          void queryClient.invalidateQueries({ queryKey: ['server-wishlist', activeUserId] });
          void queryClient.invalidateQueries({ queryKey: ['server-owned', activeUserId] });
        }
      } catch (error) {
        if (!isCancelled) {
          console.warn('Local list migration failed after sign-in.', error);
        }
        migratingUserRef.current = null;
      } finally {
        if (!isCancelled) {
          setIsMigrating(false);
        }
      }
    }

    void runMigration();

    return () => {
      isCancelled = true;
    };
  }, [queryClient, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const activeUserId = userId;
    let isCancelled = false;

    async function syncPushToken() {
      try {
        const registration = await requestPushToken();

        if (!registration || isCancelled) {
          return;
        }

        await registerPushToken(activeUserId, registration.token, registration.platform);
      } catch (error) {
        if (!isCancelled) {
          console.warn('Push token registration failed.', error);
        }
      }
    }

    void syncPushToken();

    const unsubscribe = listenForPushTokenChanges((registration) => {
      if (isCancelled) {
        return;
      }

      void registerPushToken(activeUserId, registration.token, registration.platform).catch((error) => {
        if (!isCancelled) {
          console.warn('Push token refresh registration failed.', error);
        }
      });
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [userId]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isMigrating,
    }),
    [isLoading, isMigrating, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
