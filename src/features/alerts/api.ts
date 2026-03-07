import {
  AlertEventHistoryItemSchema,
  AlertSchema,
  type Alert,
  type AlertEventHistoryItem,
} from '@/src/lib/validation/alerts';
import { supabase } from '@/src/lib/supabase/client';
import type { CountryCode, CountryScope } from '@/src/types/app';

import type { UpdateAlertInput, UpsertAlertInput } from './types';

function parseAlertRecord(record: Record<string, unknown>): Alert {
  return AlertSchema.parse({
    ...record,
    threshold_price: record.threshold_price == null ? null : Number(record.threshold_price),
    threshold_percent: record.threshold_percent == null ? null : Number(record.threshold_percent),
    cooldown_hours: Number(record.cooldown_hours),
  });
}

function getJoinedRow<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function parseAlertEventHistoryRecord(record: {
  id: string;
  alert_id: string;
  offer_id: string | null;
  trigger_price: number | string;
  triggered_at: string;
  sent_push: boolean;
  sent_email: boolean;
  alert_type: Alert['type'];
  watch_country: CountryScope;
  set_num: string;
  set_name: string;
  set_image_url?: string | null;
  retailer_name?: string | null;
  retailer_country?: CountryCode | null;
}) {
  return AlertEventHistoryItemSchema.parse({
    ...record,
    trigger_price: Number(record.trigger_price),
    retailer_name: record.retailer_name ?? null,
    retailer_country: record.retailer_country ?? null,
  });
}

export async function registerPushToken(
  userId: string,
  token: string,
  platform: 'ios' | 'android',
) {
  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      expo_push_token: token,
      platform,
    },
    {
      onConflict: 'expo_push_token',
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function unregisterPushToken(token: string) {
  const { error } = await supabase.from('push_tokens').delete().eq('expo_push_token', token);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchAlerts(watchId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('watch_id', watchId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => parseAlertRecord(row as Record<string, unknown>));
}

export async function createAlert(input: UpsertAlertInput): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .upsert(
      {
        watch_id: input.watchId,
        type: input.type,
        threshold_price: input.thresholdPrice,
        cooldown_hours: input.cooldownHours ?? 24,
        is_enabled: input.isEnabled ?? true,
      },
      {
        onConflict: 'watch_id,type',
      },
    )
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return parseAlertRecord(data as Record<string, unknown>);
}

export async function updateAlert(input: UpdateAlertInput): Promise<Alert> {
  const payload: Record<string, unknown> = {};

  if (input.thresholdPrice != null) {
    payload.threshold_price = input.thresholdPrice;
  }

  if (input.isEnabled != null) {
    payload.is_enabled = input.isEnabled;
  }

  if (input.cooldownHours != null) {
    payload.cooldown_hours = input.cooldownHours;
  }

  const { data, error } = await supabase
    .from('alerts')
    .update(payload)
    .eq('id', input.alertId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return parseAlertRecord(data as Record<string, unknown>);
}

export async function deleteAlert(alertId: string) {
  const { error } = await supabase.from('alerts').delete().eq('id', alertId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchAlertEvents(userId: string): Promise<AlertEventHistoryItem[]> {
  const { data, error } = await supabase
    .from('watchlists')
    .select(`
      id,
      country,
      sets!inner(set_num,name,image_url),
      alerts!inner(
        id,
        type,
        alert_events(
          id,
          alert_id,
          offer_id,
          trigger_price,
          triggered_at,
          sent_push,
          sent_email,
          offers(
            product_url,
            retailers(name,country)
          )
        )
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  const events = (data ?? []).flatMap((watchRow) => {
    const setRow = getJoinedRow(
      (watchRow as {
        sets?:
          | { set_num: string; name: string; image_url?: string | null }
          | { set_num: string; name: string; image_url?: string | null }[]
          | null;
      }).sets,
    );
    const alerts = ((watchRow as { alerts?: Record<string, unknown>[] }).alerts ?? []) as Record<
      string,
      unknown
    >[];

    return alerts.flatMap((alertRow) => {
      const alertEvents = (alertRow.alert_events as Record<string, unknown>[] | undefined) ?? [];

      return alertEvents.map((eventRow) => {
        const offerRow = getJoinedRow(
          eventRow.offers as
            | {
                product_url?: string | null;
                retailers?:
                  | { name?: string | null; country?: CountryCode | null }
                  | { name?: string | null; country?: CountryCode | null }[]
                  | null;
              }
            | {
                product_url?: string | null;
                retailers?:
                  | { name?: string | null; country?: CountryCode | null }
                  | { name?: string | null; country?: CountryCode | null }[]
                  | null;
              }[]
            | null,
        );
        const retailerRow = getJoinedRow(offerRow?.retailers);

        return parseAlertEventHistoryRecord({
          id: String(eventRow.id),
          alert_id: String(eventRow.alert_id),
          offer_id: eventRow.offer_id == null ? null : String(eventRow.offer_id),
          trigger_price: Number(eventRow.trigger_price),
          triggered_at: String(eventRow.triggered_at),
          sent_push: Boolean(eventRow.sent_push),
          sent_email: Boolean(eventRow.sent_email),
          alert_type: String(alertRow.type) as Alert['type'],
          watch_country: String(watchRow.country ?? '*') as CountryScope,
          set_num: String(setRow?.set_num ?? ''),
          set_name: String(setRow?.name ?? ''),
          set_image_url: setRow?.image_url ? String(setRow.image_url) : null,
          retailer_name: retailerRow?.name ? String(retailerRow.name) : null,
          retailer_country: (retailerRow?.country ?? null) as CountryCode | null,
        });
      });
    });
  });

  return events.sort(
    (left, right) => new Date(right.triggered_at).getTime() - new Date(left.triggered_at).getTime(),
  );
}
