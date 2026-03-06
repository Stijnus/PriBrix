import { type Session, type User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/src/lib/supabase/client';

type SessionContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  isLoading: true,
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
    }),
    [isLoading, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
