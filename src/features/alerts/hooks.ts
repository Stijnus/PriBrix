import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/src/lib/auth/session';
import { isClientRuntime } from '@/src/utils/runtime';

import {
  createAlert,
  deleteAlert,
  fetchAlertEvents,
  fetchAlerts,
  updateAlert,
} from './api';
import type { UpdateAlertInput, UpsertAlertInput } from './types';

function getAlertsQueryKey(watchId: string) {
  return ['alerts', watchId];
}

export function useAlerts(watchId: string | undefined, enabled = true) {
  const clientRuntime = isClientRuntime();

  const query = useQuery({
    queryKey: watchId ? getAlertsQueryKey(watchId) : ['alerts', 'empty'],
    queryFn: () => fetchAlerts(watchId!),
    enabled: clientRuntime && enabled && !!watchId,
    initialData: [],
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation({
    mutationFn: (input: UpsertAlertInput) => createAlert(input),
    onSuccess: (alert) => {
      void queryClient.invalidateQueries({ queryKey: getAlertsQueryKey(alert.watch_id) });
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: ['server-watchlist', user.id] });
        void queryClient.invalidateQueries({ queryKey: ['alert-events', user.id] });
      }
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation({
    mutationFn: (input: UpdateAlertInput) => updateAlert(input),
    onSuccess: (alert) => {
      void queryClient.invalidateQueries({ queryKey: getAlertsQueryKey(alert.watch_id) });
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: ['server-watchlist', user.id] });
        void queryClient.invalidateQueries({ queryKey: ['alert-events', user.id] });
      }
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation({
    mutationFn: ({ alertId, watchId }: { alertId: string; watchId: string }) => deleteAlert(alertId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: getAlertsQueryKey(variables.watchId) });
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: ['server-watchlist', user.id] });
        void queryClient.invalidateQueries({ queryKey: ['alert-events', user.id] });
      }
    },
  });
}

export function useAlertEvents(enabled = true) {
  const clientRuntime = isClientRuntime();
  const { user } = useSession();
  const queryKey = ['alert-events', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAlertEvents(user!.id),
    enabled: clientRuntime && enabled && !!user?.id,
    initialData: [],
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
