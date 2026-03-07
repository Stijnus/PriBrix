import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { logger } from '../logger.ts';
import { sendPushNotifications } from '../push.ts';

type SupportedAlertType =
  | 'below_base_price'
  | 'below_delivered_price'
  | 'percent_drop_30d'
  | 'lowest_90d';
type SupportedCountry = 'BE' | 'NL';

type AlertEvaluationRow = {
  id: string;
  type: SupportedAlertType;
  threshold_price: number | null;
  threshold_percent: number | null;
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

type BestPriceRecord = {
  best_base_price: number | null;
  best_base_offer_id: string | null;
  best_delivered_price: number | null;
  best_delivered_offer_id: string | null;
};

type HistoryPoint = {
  date: string;
  min_base_price: number | null;
  min_delivered_price: number | null;
};

type TriggeredAlert = {
  alert: AlertEvaluationRow;
  country: SupportedCountry;
  price: number;
  offerId: string | null;
  pushBody: string;
};

type RunAlertsResult = {
  evaluated_count: number;
  triggered_count: number;
  push_attempt_count: number;
  push_success_count: number;
};

function hasPremiumAccess(plan: {
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
} | null) {
  if (!plan || plan.plan !== 'premium') {
    return false;
  }

  if (plan.status === 'active' || plan.status === 'past_due') {
    return true;
  }

  if (!plan.current_period_end) {
    return false;
  }

  return new Date(plan.current_period_end).getTime() > Date.now();
}

function getJoinedRow<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function parseAlertRows(rows: Record<string, unknown>[]): AlertEvaluationRow[] {
  return rows.flatMap((row) => {
    const watchRow = getJoinedRow(
      row.watchlists as
        | {
            id: string;
            user_id: string;
            set_id: string;
            country: 'BE' | 'NL' | '*';
            sets?: { set_num: string; name: string } | { set_num: string; name: string }[] | null;
          }
        | {
            id: string;
            user_id: string;
            set_id: string;
            country: 'BE' | 'NL' | '*';
            sets?: { set_num: string; name: string } | { set_num: string; name: string }[] | null;
          }[]
        | null,
    );
    const setRow = getJoinedRow(watchRow?.sets);

    if (!watchRow || !setRow) {
      return [];
    }

    const alertType = String(row.type);

    if (
      alertType !== 'below_base_price' &&
      alertType !== 'below_delivered_price' &&
      alertType !== 'percent_drop_30d' &&
      alertType !== 'lowest_90d'
    ) {
      return [];
    }

    return [
      {
        id: String(row.id),
        type: alertType,
        threshold_price: row.threshold_price == null ? null : Number(row.threshold_price),
        threshold_percent: row.threshold_percent == null ? null : Number(row.threshold_percent),
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

function getPriceHistoryKey(setId: string, country: SupportedCountry) {
  return `${setId}:${country}`;
}

function getClosestHistoryPointBefore(points: HistoryPoint[], targetDate: string) {
  const eligible = points.filter((point) => point.date <= targetDate && point.min_base_price != null);
  return eligible.length > 0 ? eligible[eligible.length - 1] ?? null : null;
}

function getMinimumBasePrice(points: HistoryPoint[]) {
  const basePrices = points
    .map((point) => point.min_base_price)
    .filter((price): price is number => price != null);

  if (basePrices.length === 0) {
    return null;
  }

  return Math.min(...basePrices);
}

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function isCooldownActive(triggeredAt: string | undefined, cooldownHours: number) {
  if (!triggeredAt) {
    return false;
  }

  const lastTriggered = new Date(triggeredAt).getTime();
  const cooldownMilliseconds = cooldownHours * 60 * 60 * 1000;
  return lastTriggered + cooldownMilliseconds > Date.now();
}

function pickLowestPriceCandidate(
  alert: AlertEvaluationRow,
  bestPriceMap: Map<string, BestPriceRecord>,
): { country: SupportedCountry; price: number; offerId: string | null } | null {
  const countries = getCandidateCountries(alert.watch.country);
  let candidate: { country: SupportedCountry; price: number; offerId: string | null } | null = null;

  for (const country of countries) {
    const row = bestPriceMap.get(getPriceHistoryKey(alert.watch.set_id, country));

    if (!row) {
      continue;
    }

    const price = alert.type === 'below_delivered_price' ? row.best_delivered_price : row.best_base_price;
    const offerId =
      alert.type === 'below_delivered_price' ? row.best_delivered_offer_id : row.best_base_offer_id;

    if (price == null) {
      continue;
    }

    if (!candidate || price < candidate.price) {
      candidate = {
        country,
        price,
        offerId,
      };
    }
  }

  return candidate;
}

function evaluateAlert(
  alert: AlertEvaluationRow,
  bestPriceMap: Map<string, BestPriceRecord>,
  historyMap: Map<string, HistoryPoint[]>,
): TriggeredAlert | null {
  const candidate = pickLowestPriceCandidate(alert, bestPriceMap);

  if (!candidate) {
    return null;
  }

  if (
    (alert.type === 'below_base_price' || alert.type === 'below_delivered_price') &&
    alert.threshold_price != null &&
    candidate.price <= alert.threshold_price
  ) {
    return {
      alert,
      country: candidate.country,
      price: candidate.price,
      offerId: candidate.offerId,
      pushBody: `${alert.watch.set_name} is now EUR ${candidate.price.toFixed(2)}.`,
    };
  }

  if (alert.type === 'percent_drop_30d' && alert.threshold_percent != null) {
    const historyPoints = historyMap.get(getPriceHistoryKey(alert.watch.set_id, candidate.country)) ?? [];
    const referencePoint = getClosestHistoryPointBefore(historyPoints, getDateDaysAgo(30));

    if (!referencePoint?.min_base_price || referencePoint.min_base_price <= 0) {
      return null;
    }

    const percentDrop = ((referencePoint.min_base_price - candidate.price) / referencePoint.min_base_price) * 100;

    if (percentDrop >= alert.threshold_percent) {
      return {
        alert,
        country: candidate.country,
        price: candidate.price,
        offerId: candidate.offerId,
        pushBody: `${alert.watch.set_name} dropped ${percentDrop.toFixed(1)}% in 30 days.`,
      };
    }
  }

  if (alert.type === 'lowest_90d') {
    const historyPoints = historyMap.get(getPriceHistoryKey(alert.watch.set_id, candidate.country)) ?? [];
    const minimumPrice = getMinimumBasePrice(historyPoints);

    if (minimumPrice != null && candidate.price <= minimumPrice) {
      return {
        alert,
        country: candidate.country,
        price: candidate.price,
        offerId: candidate.offerId,
        pushBody: `${alert.watch.set_name} just hit a new 90-day low.`,
      };
    }
  }

  return null;
}

export async function runAlertsAfterIngest(supabase: SupabaseClient): Promise<RunAlertsResult> {
  const { data: rawAlerts, error: alertsError } = await supabase
    .from('alerts')
    .select(`
      id,
      type,
      threshold_price,
      threshold_percent,
      cooldown_hours,
      watchlists!inner(
        id,
        user_id,
        set_id,
        country,
        sets!inner(set_num,name)
      )
    `)
    .eq('is_enabled', true);

  if (alertsError) {
    throw new Error(alertsError.message);
  }

  const alerts = parseAlertRows((rawAlerts ?? []) as Record<string, unknown>[]);

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
  const userIds = Array.from(new Set(alerts.map((alert) => alert.watch.user_id)));
  const historyStartDate = getDateDaysAgo(90);

  const [
    { data: bestPriceRows, error: bestPricesError },
    { data: lastEventRows, error: lastEventsError },
    { data: historyRows, error: historyError },
    { data: planRows, error: planError },
  ] = await Promise.all([
    supabase
      .from('set_best_prices_daily')
      .select('set_id,country,best_base_price,best_base_offer_id,best_delivered_price,best_delivered_offer_id')
      .in('set_id', setIds),
    supabase
      .from('alert_events')
      .select('alert_id,triggered_at')
      .in('alert_id', alertIds)
      .order('triggered_at', { ascending: false }),
    supabase
      .from('set_price_daily')
      .select('set_id,country,date,min_base_price,min_delivered_price')
      .in('set_id', setIds)
      .gte('date', historyStartDate)
      .order('date', { ascending: true }),
    supabase
      .from('user_plans')
      .select('user_id,plan,status,current_period_end')
      .in('user_id', userIds),
  ]);

  if (bestPricesError) {
    throw new Error(bestPricesError.message);
  }

  if (lastEventsError) {
    throw new Error(lastEventsError.message);
  }

  if (historyError) {
    throw new Error(historyError.message);
  }

  if (planError) {
    throw new Error(planError.message);
  }

  const bestPriceMap = new Map<string, BestPriceRecord>();
  const historyMap = new Map<string, HistoryPoint[]>();
  const lastTriggeredMap = new Map<string, string>();
  const premiumAccessByUserId = new Map(
    (planRows ?? []).map((row) => [
      String(row.user_id),
      hasPremiumAccess({
        plan: row.plan == null ? null : String(row.plan),
        status: row.status == null ? null : String(row.status),
        current_period_end: row.current_period_end == null ? null : String(row.current_period_end),
      }),
    ]),
  );

  for (const row of bestPriceRows ?? []) {
    bestPriceMap.set(getPriceHistoryKey(String(row.set_id), String(row.country) as SupportedCountry), {
      best_base_price: row.best_base_price == null ? null : Number(row.best_base_price),
      best_base_offer_id: row.best_base_offer_id == null ? null : String(row.best_base_offer_id),
      best_delivered_price: row.best_delivered_price == null ? null : Number(row.best_delivered_price),
      best_delivered_offer_id:
        row.best_delivered_offer_id == null ? null : String(row.best_delivered_offer_id),
    });
  }

  for (const row of historyRows ?? []) {
    const key = getPriceHistoryKey(String(row.set_id), String(row.country) as SupportedCountry);
    const current = historyMap.get(key) ?? [];

    current.push({
      date: String(row.date).slice(0, 10),
      min_base_price: row.min_base_price == null ? null : Number(row.min_base_price),
      min_delivered_price: row.min_delivered_price == null ? null : Number(row.min_delivered_price),
    });
    historyMap.set(key, current);
  }

  for (const row of lastEventRows ?? []) {
    const alertId = String(row.alert_id);

    if (!lastTriggeredMap.has(alertId)) {
      lastTriggeredMap.set(alertId, String(row.triggered_at));
    }
  }

  const triggeredAlerts = alerts.flatMap((alert) => {
    const isPremiumUser = premiumAccessByUserId.get(alert.watch.user_id) ?? false;

    if (!isPremiumUser && alert.type !== 'below_base_price') {
      return [];
    }

    if (isCooldownActive(lastTriggeredMap.get(alert.id), alert.cooldown_hours)) {
      return [];
    }

    const triggered = evaluateAlert(alert, bestPriceMap, historyMap);
    return triggered ? [triggered] : [];
  });

  for (const entry of triggeredAlerts) {
    logger.info('analytics_event', {
      event: 'alert_triggered',
      set_num: entry.alert.watch.set_num,
      trigger_price: entry.price,
      alert_type: entry.alert.type,
      country: entry.country,
    });
  }

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
      triggeredAlerts.map((entry) => ({
        alert_id: entry.alert.id,
        offer_id: entry.offerId,
        trigger_price: entry.price,
        sent_push: false,
        sent_email: false,
      })),
    )
    .select('id,alert_id');

  if (insertEventsError) {
    throw new Error(insertEventsError.message);
  }

  const insertedEventMap = new Map(
    (insertedEvents ?? []).map((event) => [String(event.alert_id), String(event.id)]),
  );
  const triggeredUserIds = Array.from(new Set(triggeredAlerts.map((entry) => entry.alert.watch.user_id)));
  const offerIds = Array.from(
    new Set(triggeredAlerts.flatMap((entry) => (entry.offerId ? [entry.offerId] : []))),
  );

  const [{ data: pushTokens, error: pushTokensError }, { data: offerRows, error: offerRowsError }] =
    await Promise.all([
      supabase.from('push_tokens').select('user_id,expo_push_token').in('user_id', triggeredUserIds),
      offerIds.length > 0
        ? supabase.from('set_offers_with_latest').select('offer_id,retailer_name').in('offer_id', offerIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (pushTokensError) {
    throw new Error(pushTokensError.message);
  }

  if (offerRowsError) {
    throw new Error(offerRowsError.message);
  }

  const tokensByUserId = new Map<string, string[]>();
  const retailerByOfferId = new Map(
    (offerRows ?? []).map((row) => [String(row.offer_id), String(row.retailer_name)]),
  );

  for (const row of pushTokens ?? []) {
    const userId = String(row.user_id);
    const tokens = tokensByUserId.get(userId) ?? [];

    tokens.push(String(row.expo_push_token));
    tokensByUserId.set(userId, tokens);
  }

  const pushMessages = triggeredAlerts.flatMap((entry) => {
    const eventId = insertedEventMap.get(entry.alert.id);
    const tokens = tokensByUserId.get(entry.alert.watch.user_id) ?? [];
    const retailerName = entry.offerId ? retailerByOfferId.get(entry.offerId) : null;

    if (!eventId) {
      return [];
    }

    return tokens.map((token) => ({
      eventId,
      token,
      title: 'Price alert',
      body: retailerName ? `${entry.pushBody} ${retailerName}.` : entry.pushBody,
      data: {
        setNum: entry.alert.watch.set_num,
      },
    }));
  });

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
