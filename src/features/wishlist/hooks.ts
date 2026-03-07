import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addToServerWishlist,
  fetchServerWishlist,
  removeFromServerWishlist,
  updateServerWishlistItem,
} from '@/src/features/wishlist/api';
import { useSession } from '@/src/lib/auth/session';
import { getLocalWishlist, setLocalWishlist } from '@/src/lib/storage/localLists';
import type { LocalWishlistItem } from '@/src/lib/validation/lists';
import { isClientRuntime } from '@/src/utils/runtime';

const localQueryKey = ['local-wishlist'];

export type WishlistEntry = LocalWishlistItem & {
  id?: string;
  set_id?: string;
  created_at?: string;
  updated_at?: string;
};

export function useLocalWishlist(enabled = true) {
  const queryClient = useQueryClient();
  const clientRuntime = isClientRuntime();

  const query = useQuery({
    queryKey: localQueryKey,
    queryFn: getLocalWishlist,
    enabled: clientRuntime && enabled,
    initialData: [] as WishlistEntry[],
  });

  const addMutation = useMutation({
    mutationFn: async (item: LocalWishlistItem) => {
      const currentItems = await getLocalWishlist();
      const nextItems = currentItems.some((entry) => entry.set_num === item.set_num)
        ? currentItems.map((entry) => (entry.set_num === item.set_num ? { ...entry, ...item } : entry))
        : [item, ...currentItems];

      await setLocalWishlist(nextItems);
      return nextItems;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(localQueryKey, items);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ setNum, updates }: { setNum: string; updates: Partial<LocalWishlistItem> }) => {
      const currentItems = await getLocalWishlist();
      const nextItems = currentItems.map((entry) => (entry.set_num === setNum ? { ...entry, ...updates } : entry));

      await setLocalWishlist(nextItems);
      return nextItems;
    },
    onSuccess: (items) => {
      queryClient.setQueryData(localQueryKey, items);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (setNum: string) => {
      const currentItems = await getLocalWishlist();
      const nextItems = currentItems.filter((entry) => entry.set_num !== setNum);

      await setLocalWishlist(nextItems);
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

function useServerWishlist(userId: string | undefined, enabled = true) {
  const queryClient = useQueryClient();
  const clientRuntime = isClientRuntime();
  const queryKey = ['server-wishlist', userId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchServerWishlist(userId!),
    enabled: clientRuntime && enabled && !!userId,
    initialData: [] as WishlistEntry[],
  });

  const addMutation = useMutation({
    mutationFn: async (item: LocalWishlistItem) => addToServerWishlist(userId!, item),
    onSuccess: (item) => {
      const currentItems = queryClient.getQueryData<WishlistEntry[]>(queryKey) ?? [];
      const nextItems = currentItems.some((entry) => entry.set_num === item.set_num)
        ? currentItems.map((entry) => (entry.set_num === item.set_num ? item : entry))
        : [item, ...currentItems];

      queryClient.setQueryData(queryKey, nextItems);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ setNum, updates }: { setNum: string; updates: Partial<LocalWishlistItem> }) => {
      const currentItems = queryClient.getQueryData<WishlistEntry[]>(queryKey) ?? [];
      const target = currentItems.find((entry) => entry.set_num === setNum);

      if (!target?.id) {
        return currentItems;
      }

      const nextItem = await updateServerWishlistItem(target.id, updates);
      return currentItems.map((entry) => (entry.id === target.id ? nextItem : entry));
    },
    onSuccess: (items) => {
      queryClient.setQueryData(queryKey, items);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (setNum: string) => {
      const currentItems = queryClient.getQueryData<WishlistEntry[]>(queryKey) ?? [];
      const target = currentItems.find((entry) => entry.set_num === setNum);

      if (!target?.id) {
        return currentItems;
      }

      await removeFromServerWishlist(target.id);
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

export function useWishlist() {
  const { user } = useSession();
  const local = useLocalWishlist(!user);
  const server = useServerWishlist(user?.id, !!user);

  return user ? server : local;
}
