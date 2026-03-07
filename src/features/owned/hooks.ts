import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addToServerOwned,
  fetchServerOwned,
  removeFromServerOwned,
  updateServerOwnedItem,
} from '@/src/features/owned/api';
import { useSession } from '@/src/lib/auth/session';
import { getLocalOwned, setLocalOwned } from '@/src/lib/storage/localLists';
import type { LocalOwnedItem } from '@/src/lib/validation/lists';
import { isClientRuntime } from '@/src/utils/runtime';

const localQueryKey = ['local-owned'];

export type OwnedEntry = LocalOwnedItem & {
  id?: string;
  set_id?: string;
  created_at?: string;
  updated_at?: string;
};

export function useLocalOwned(enabled = true) {
  const queryClient = useQueryClient();
  const clientRuntime = isClientRuntime();

  const query = useQuery({
    queryKey: localQueryKey,
    queryFn: getLocalOwned,
    enabled: clientRuntime && enabled,
    initialData: [] as OwnedEntry[],
  });

  const addMutation = useMutation({
    mutationFn: async (item: LocalOwnedItem) => {
      const currentItems = await getLocalOwned();
      const nextItems = currentItems.some((entry) => entry.set_num === item.set_num)
        ? currentItems.map((entry) => (entry.set_num === item.set_num ? { ...entry, ...item } : entry))
        : [item, ...currentItems];

      await setLocalOwned(nextItems);
      return nextItems;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(localQueryKey, items);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ setNum, updates }: { setNum: string; updates: Partial<LocalOwnedItem> }) => {
      const currentItems = await getLocalOwned();
      const nextItems = currentItems.map((entry) => (entry.set_num === setNum ? { ...entry, ...updates } : entry));

      await setLocalOwned(nextItems);
      return nextItems;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(localQueryKey, items);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (setNum: string) => {
      const currentItems = await getLocalOwned();
      const nextItems = currentItems.filter((entry) => entry.set_num !== setNum);

      await setLocalOwned(nextItems);
      return nextItems;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(localQueryKey, items);
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    addItem: addMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    removeItem: removeMutation.mutateAsync,
    mode: 'local' as const,
  };
}

function useServerOwned(userId: string | undefined, enabled = true) {
  const queryClient = useQueryClient();
  const clientRuntime = isClientRuntime();
  const queryKey = ['server-owned', userId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchServerOwned(userId!),
    enabled: clientRuntime && enabled && !!userId,
    initialData: [] as OwnedEntry[],
  });

  const addMutation = useMutation({
    mutationFn: async (item: LocalOwnedItem) => addToServerOwned(userId!, item),
    onSuccess: (item) => {
      const currentItems = queryClient.getQueryData<OwnedEntry[]>(queryKey) ?? [];
      const nextItems = currentItems.some((entry) => entry.set_num === item.set_num)
        ? currentItems.map((entry) => (entry.set_num === item.set_num ? item : entry))
        : [item, ...currentItems];

      queryClient.setQueryData(queryKey, nextItems);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ setNum, updates }: { setNum: string; updates: Partial<LocalOwnedItem> }) => {
      const currentItems = queryClient.getQueryData<OwnedEntry[]>(queryKey) ?? [];
      const target = currentItems.find((entry) => entry.set_num === setNum);

      if (!target?.id) {
        return currentItems;
      }

      const nextItem = await updateServerOwnedItem(target.id, updates);
      return currentItems.map((entry) => (entry.id === target.id ? nextItem : entry));
    },
    onSuccess: (items) => {
      queryClient.setQueryData(queryKey, items);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (setNum: string) => {
      const currentItems = queryClient.getQueryData<OwnedEntry[]>(queryKey) ?? [];
      const target = currentItems.find((entry) => entry.set_num === setNum);

      if (!target?.id) {
        return currentItems;
      }

      await removeFromServerOwned(target.id);
      return currentItems.filter((entry) => entry.id !== target.id);
    },
    onSuccess: (items) => {
      queryClient.setQueryData(queryKey, items);
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    addItem: addMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    removeItem: removeMutation.mutateAsync,
    mode: 'server' as const,
  };
}

export function useOwned() {
  const { user } = useSession();
  const local = useLocalOwned(!user);
  const server = useServerOwned(user?.id, !!user);

  return user ? server : local;
}
