import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchServerWatchlist, addToServerWatchlist, removeFromServerWatchlist } from '@/src/features/watchlist/api';
import { useSession } from '@/src/lib/auth/session';
import { getLocalWatchlist, setLocalWatchlist } from '@/src/lib/storage/localLists';
import type { LocalWatchItem } from '@/src/lib/validation/lists';
import { isClientRuntime } from '@/src/utils/runtime';

const localQueryKey = ['local-watchlist'];

export type WatchlistEntry = LocalWatchItem & {
  id?: string;
  set_id?: string;
  created_at?: string;
  updated_at?: string;
};

export function useLocalWatchlist(enabled = true) {
  const queryClient = useQueryClient();
  const clientRuntime = isClientRuntime();

  const query = useQuery({
    queryKey: localQueryKey,
    queryFn: getLocalWatchlist,
    enabled: clientRuntime && enabled,
    initialData: [] as WatchlistEntry[],
  });

  const addMutation = useMutation({
    mutationFn: async (item: LocalWatchItem) => {
      const currentItems = await getLocalWatchlist();
      const nextItems = currentItems.some(
        (entry) => entry.set_num === item.set_num && (entry.country ?? '*') === (item.country ?? '*'),
      )
        ? currentItems.map((entry) =>
            entry.set_num === item.set_num && (entry.country ?? '*') === (item.country ?? '*')
              ? { ...entry, ...item }
              : entry,
          )
        : [item, ...currentItems];

      await setLocalWatchlist(nextItems);
      return nextItems;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(localQueryKey, items);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ setNum, country }: { setNum: string; country?: LocalWatchItem['country'] }) => {
      const currentItems = await getLocalWatchlist();
      const nextItems = currentItems.filter(
        (entry) => !(entry.set_num === setNum && (entry.country ?? '*') === (country ?? '*')),
      );

      await setLocalWatchlist(nextItems);
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
    removeItem: removeMutation.mutateAsync,
    mode: 'local' as const,
  };
}

function useServerWatchlist(userId: string | undefined, enabled = true) {
  const queryClient = useQueryClient();
  const clientRuntime = isClientRuntime();
  const queryKey = ['server-watchlist', userId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchServerWatchlist(userId!),
    enabled: clientRuntime && enabled && !!userId,
    initialData: [] as WatchlistEntry[],
  });

  const addMutation = useMutation({
    mutationFn: async (item: LocalWatchItem) => addToServerWatchlist(userId!, item),
    onSuccess: (item) => {
      const currentItems = queryClient.getQueryData<WatchlistEntry[]>(queryKey) ?? [];
      const nextItems = currentItems.some(
        (entry) => entry.set_num === item.set_num && (entry.country ?? '*') === (item.country ?? '*'),
      )
        ? currentItems.map((entry) =>
            entry.set_num === item.set_num && (entry.country ?? '*') === (item.country ?? '*')
              ? item
              : entry,
          )
        : [item, ...currentItems];

      queryClient.setQueryData(queryKey, nextItems);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ setNum, country }: { setNum: string; country?: LocalWatchItem['country'] }) => {
      const currentItems = queryClient.getQueryData<WatchlistEntry[]>(queryKey) ?? [];
      const target = currentItems.find(
        (entry) => entry.set_num === setNum && (entry.country ?? '*') === (country ?? '*'),
      );

      if (!target?.id) {
        return currentItems;
      }

      await removeFromServerWatchlist(target.id);
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
    removeItem: removeMutation.mutateAsync,
    mode: 'server' as const,
  };
}

export function useWatchlist() {
  const { user } = useSession();
  const local = useLocalWatchlist(!user);
  const server = useServerWatchlist(user?.id, !!user);

  return user ? server : local;
}
