import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { logger } from '../logger.ts';
import { sendPushNotifications } from '../push.ts';

type SupportedAlertType = 'below_base_price' | 'below_delivered_price';
type SupportedCountry = 'BE' | 'NL';

type AlertEvaluationRow = {
  id: string;
  type: SupportedAlertType;
  threshold_price: number | null;
  cooldown_hours: number;
  watch: {
    id: string;
    user_id: string;
    set_id: string;
    country: 'BE' | 'NL' | '*';
    set_num: string;
    set_name: string;
  };
};

type BestPriceCandidate = {
  price: number;
  offerId: string | null;
  country: SupportedCountry;
};

type RunAlertsResult = {
  evaluated_count: number;
  triggered_count: number;
  push_attempt_count: number;
  push_success_count: number;
};

function getJoinedRow<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function parseAlertRows(
  rows: Array<Record<string, unknown>>,
): AlertEvaluationRow[] {
  return rows.flatMap((row) => {
    const watchRow = getJoinedRow(
      row.watchlists as
        | {
            id: string;
            user_id: string;
            set_id: string;
            country: 'BE' | 'NL' | '*';
            sets?: { set_num: string; name: string } | Array<{ set_num: string; name: string }> | null;
          }
        | Array<{
            id: string;
            user_id: string;
            set_id: string;
            country: 'BE' | 'NL' | '*';
            sets?: { set_num: string; name: string } | Array<{ set_num: string; name: string }> | null;
          }>
        | null,
    );
    const setRow = getJoinedRow(watchRow?.sets);

    if (!watchRow || !setRow) {
      return [];
    }

    const alertType = String(row.type);

    if (alertType !== 'below_base_price' && alertType !== 'below_delivered_price') {
      return [];
    }

    return [
      {
        id: String(row.id),
        type: alertType,
        threshold_price:
          row.threshold_price == null ? null : Number(row.threshold_price),
        cooldown_hours: Number(row.cooldown_hours),
        watch: {
          id: String(watchRow.id),
          user_id: String(watchRow.user_id),
          set_id: String(watchRow.set_id),
          country: String(watchRow.country ?? '*') as 'BE' | 'NL' | '*',
          set_num: String(setRow.set_num),
          set_name: String(setRow.name),
        },
      },
    ];
  });
}

function getCandidateCountries(country: 'BE' | 'NL' | '*') {
  return country === '*' ? (['BE', 'NL'] as const) : ([country] as const);
}

function pickBestCandidate(
  alert: AlertEvaluationRow,
  bestPriceMap: Map<string, {
    best_base_price: number | null;
    best_base_offer_id: string | null;
    best_delivered_price: number | null;
    best_delivered_offer_id: string | null;
  }>,
): BestPriceCandidate | null {
  const countries = getCandidateCountries(alert.watch.country);
  let candidate: BestPriceCandidate | null = null;

  for (const country of countries) {
    const row = bestPriceMap.get(`${alert.watch.set_id}:${country}`);

    if (!row) {
      continue;
    }

    const price =
      alert.type === 'below_base_price'
        ? row.best_base_price
        : row.best_delivered_price;
    const offerId =
      alert.type === 'below_base_price'
        ? row.best_base_offer_id
        : row.best_delivered_offer_id;

    if (price == null) {
      continue;
    }

    if (!candidate || price < candidate.price) {
      candidate = {
        price,
        offerId,
        country,
      };
    }
  }

  return candidate;
}

function isCooldownActive(triggeredAt: string | undefined, cooldownHours: number) {
  if (!triggeredAt) {
    return false;
  }

  const lastTriggered = new Date(triggeredAt).getTime();
  const cooldownMilliseconds = cooldownHours * 60 * 60 * 1000;
  return lastTriggered + cooldownMilliseconds > Date.now();
}

export async function runAlertsAfterIngest(
  supabase: SupabaseClient,
): Promise<RunAlertsResult> {
  const { data: rawAlerts, error: alertsError } = await supabase
    .from('alerts')
    .select(`
      id,
      type,
      threshold_price,
      cooldown_hours,
      watchlists!inner(
        id,
        user_id,
        set_id,
        country,
        sets!inner(set_num,name)
      )
    `)
    .eq('is_enabled', true)
    .in('type', ['below_base_price', 'below_delivered_price']);

  if (alertsError) {
    throw new Error(alertsError.message);
  }

  const alerts = parseAlertRows((rawAlerts ?? []) as Array<Record<string, unknown>>);

  if (alerts.length === 0) {
    return {
      evaluated_count: 0,
      triggered_count: 0,
      push_attempt_count: 0,
      push_success_count: 0,
    };
  }

  const setIds = Array.from(new Set(alerts.map((alert) => alert.watch.set_id)));
  const alertIds = alerts.map((alert) => alert.id);

  const [{ data: bestPriceRows, error: bestPricesError }, { data: lastEventRows, error: lastEventsError }] =
    await Promise.all([
      supabase
        .from('set_best_prices_daily')
        .select('set_id,country,best_base_price,best_base_offer_id,best_delivered_price,best_delivered_offer_id')
        .in('set_id', setIds),
      supabase
        .from('alert_events')
        .select('alert_id,triggered_at')
        .in('alert_id', alertIds)
        .order('triggered_at', { ascending: false }),
    ]);

  if (bestPricesError) {
    throw new Error(bestPricesError.message);
  }

  if (lastEventsError) {
    throw new Error(lastEventsError.message);
  }

  const bestPriceMap = new Map<string, {
    best_base_price: number | null;
    best_base_offer_id: string | null;
    best_delivered_price: number | null;
    best_delivered_offer_id: string | null;
  }>();
  const lastTriggeredMap = new Map<string, string>();

  for (const row of bestPriceRows ?? []) {
    bestPriceMap.set(`${row.set_id}:${row.country}`, {
      best_base_price: row.best_base_price == null ? null : Number(row.best_base_price),
      best_base_offer_id: row.best_base_offer_id == null ? null : String(row.best_base_offer_id),
      best_delivered_price:
        row.best_delivered_price == null ? null : Number(row.best_delivered_price),
      best_delivered_offer_id:
        row.best_delivered_offer_id == null ? null : String(row.best_delivered_offer_id),
    });
  }

  for (const row of lastEventRows ?? []) {
    const alertId = String(row.alert_id);

    if (!lastTriggeredMap.has(alertId)) {
      lastTriggeredMap.set(alertId, String(row.triggered_at));
    }
  }

  const triggeredAlerts = alerts.flatMap((alert) => {
    if (alert.threshold_price == null) {
      return [];
    }

    const candidate = pickBestCandidate(alert, bestPriceMap);

    if (!candidate || candidate.price > alert.threshold_price) {
      return [];
    }

    if (isCooldownActive(lastTriggeredMap.get(alert.id), alert.cooldown_hours)) {
      return [];
    }

    return [
      {
        alert,
        candidate,
      },
    ];
  });

  if (triggeredAlerts.length === 0) {
    return {
      evaluated_count: alerts.length,
      triggered_count: 0,
      push_attempt_count: 0,
      push_success_count: 0,
    };
  }

  const { data: insertedEvents, error: insertEventsError } = await supabase
    .from('alert_events')
    .insert(
      triggeredAlerts.map(({ alert, candidate }) => ({
        alert_id: alert.id,
        offer_id: candidate.offerId,
        trigger_price: candidate.price,
        sent_push: false,
        sent_email: false,
      })),
    )
    .select('id,alert_id,offer_id,trigger_price');

  if (insertEventsError) {
    throw new Error(insertEventsError.message);
  }

  const insertedEventMap = new Map(
    (insertedEvents ?? []).map((event) => [String(event.alert_id), {
      id: String(event.id),
      offer_id: event.offer_id == null ? null : String(event.offer_id),
      trigger_price: Number(event.trigger_price),
    }]),
  );
  const userIds = Array.from(new Set(triggeredAlerts.map(({ alert }) => alert.watch.user_id)));
  const offerIds = Array.from(
    new Set(
      triggeredAlerts.flatMap(({ candidate }) => (candidate.offerId ? [candidate.offerId] : [])),
    ),
  );

  const [{ data: pushTokens, error: pushTokensError }, { data: offerRows, error: offerRowsError }] =
    await Promise.all([
      supabase
        .from('push_tokens')
        .select('user_id,expo_push_token')
        .in('user_id', userIds),
      offerIds.length > 0
        ? supabase
            .from('set_offers_with_latest')
            .select('offer_id,retailer_name,country')
            .in('offer_id', offerIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (pushTokensError) {
    throw new Error(pushTokensError.message);
  }

  if (offerRowsError) {
    throw new Error(offerRowsError.message);
  }

  const tokensByUserId = new Map<string, string[]>();
  const offerMap = new Map(
    (offerRows ?? []).map((row) => [
      String(row.offer_id),
      {
        retailer_name: String(row.retailer_name),
        country: String(row.country),
      },
    ]),
  );

  for (const row of pushTokens ?? []) {
    const userId = String(row.user_id);
    const currentTokens = tokensByUserId.get(userId) ?? [];

    currentTokens.push(String(row.expo_push_token));
    tokensByUserId.set(userId, currentTokens);
  }

  const pushMessages = triggeredAlerts.flatMap(({ alert, candidate }) => {
    const event = insertedEventMap.get(alert.id);
    const tokens = tokensByUserId.get(alert.watch.user_id) ?? [];
    const retailer = candidate.offerId ? offerMap.get(candidate.offerId) : null;

    return tokens.map((token) => ({
      eventId: event?.id ?? '',
      token,
      title: 'Price drop!',
      body: `${alert.watch.set_name} is now EUR ${candidate.price.toFixed(2)} at ${
        retailer?.retailer_name ?? `best price in ${candidate.country}`
      }`,
      data: {
        setNum: alert.watch.set_num,
      },
    }));
  }).filter((message) => message.eventId.length > 0);

  const pushResults = await sendPushNotifications(supabase, pushMessages);
  const successfulEventIds = Array.from(
    new Set(pushResults.filter((result) => result.ok).map((result) => result.eventId)),
  );

  if (successfulEventIds.length > 0) {
    const { error } = await supabase
      .from('alert_events')
      .update({ sent_push: true })
      .in('id', successfulEventIds);

    if (error) {
      logger.warn('Failed to mark alert events as sent_push=true', {
        error: error.message,
        eventCount: successfulEventIds.length,
      });
    }
  }

  return {
    evaluated_count: alerts.length,
    triggered_count: triggeredAlerts.length,
    push_attempt_count: pushMessages.length,
    push_success_count: successfulEventIds.length,
  };
}
