import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  defaultPreferences,
  getPreferences,
  setPreferences,
  type Preferences,
} from '@/src/lib/storage/preferences';
import { isClientRuntime } from '@/src/utils/runtime';

const preferencesQueryKey = ['preferences'];

export function usePreferences() {
  const queryClient = useQueryClient();
  const clientRuntime = isClientRuntime();

  const query = useQuery({
    queryKey: preferencesQueryKey,
    queryFn: getPreferences,
    enabled: clientRuntime,
    initialData: defaultPreferences,
  });

  const mutation = useMutation({
    mutationFn: async (patch: Partial<Preferences>) => {
      const currentPreferences = queryClient.getQueryData<Preferences>(preferencesQueryKey) ?? defaultPreferences;
      const nextPreferences = {
        ...currentPreferences,
        ...patch,
      };

      await setPreferences(nextPreferences);
      return nextPreferences;
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(preferencesQueryKey, preferences);
    },
  });

  return {
    preferences: query.data ?? defaultPreferences,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    updatePreferences: mutation.mutateAsync,
  };
}
