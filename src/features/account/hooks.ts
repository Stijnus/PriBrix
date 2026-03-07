import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearAppStorage } from '@/src/lib/storage/appState';
import { supabase } from '@/src/lib/supabase/client';
import { useSession } from '@/src/lib/auth/session';

import { deleteAccount } from './api';

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation({
    mutationFn: () => {
      if (!user?.email) {
        throw new Error('Sign in again before deleting this account.');
      }

      return deleteAccount({
        confirmEmail: user.email,
      });
    },
    onSuccess: async (result) => {
      await clearAppStorage(result.userId);
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut({ scope: 'local' });
    },
  });
}
