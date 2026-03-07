import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { getAwinFeedConfigs, getBolFeedConfigs, getIngestionSecret, getMockFeedEnabled } from '../_shared/env.ts';
import { generateMockProducts } from '../_shared/connectors/mock/generate.ts';
import { logger } from '../_shared/logger.ts';
import { resolveSetId } from '../_shared/matching/resolveSetId.ts';
import { computeDelivered } from '../_shared/pricing/computeDelivered.ts';
import { createServiceRoleClient } from '../_shared/supabaseClient.ts';
import type { IngestionResult, NormalizedProduct } from '../_shared/types.ts';
import { downloadBolFeed } from '../_shared/connectors/bol/download.ts';
import { parseBolFeed } from '../_shared/connectors/bol/parse.ts';
import { normalizeBolProducts } from '../_shared/connectors/bol/normalize.ts';
import { downloadAwinFeed } from '../_shared/connectors/awin/download.ts';
import { parseAwinFeed } from '../_shared/connectors/awin/parse.ts';
import { normalizeAwinProducts } from '../_shared/connectors/awin/normalize.ts';
import { runAlertsAfterIngest } from '../_shared/alerts/runAlerts.ts';

const ACTIVE_OFFER_WINDOW_DAYS = 7;
const SUPPORTED_COUNTRIES = ['BE', 'NL'] as const;

function getActiveCutoffIso() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - ACTIVE_OFFER_WINDOW_DAYS);
  return date.toISOString();
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function truncateErrors(errors: string[]) {
  return errors.slice(0, 10).join('\n');
}

function unauthorizedResponse() {
  return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
}

async function createRun(supabase: SupabaseClient, source: string) {
  const { data, error } = await supabase
    .from('ingestion_runs')
    .insert({
      source,
      status: 'running',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return String(data.id);
}

async function finalizeRun(
  supabase: SupabaseClient,
  runId: string,
  result: IngestionResult,
  status: 'success' | 'error',
) {
  const { error } = await supabase
    .from('ingestion_runs')
    .update({
      status,
      finished_at: new Date().toISOString(),
      offers_processed: result.offers_processed,
      snapshots_inserted: result.snapshots_inserted,
      error_message: result.errors.length > 0 ? truncateErrors(result.errors) : null,
    })
    .eq('id', runId);

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertOffer(supabase: SupabaseClient, product: NormalizedProduct, setId: string) {
  const { data, error } = await supabase
    .from('offers')
    .upsert(
      {
        retailer_id: product.retailer_id,
        set_id: setId,
        source_product_id: product.source_product_id,
        ean: product.ean,
        product_url: product.product_url,
        title_raw: product.title,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'retailer_id,source_product_id',
      },
    )
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return String(data.id);
}

async function insertSnapshotIfChanged(
  supabase: SupabaseClient,
  offerId: string,
  product: NormalizedProduct,
) {
  const today = getTodayDate();
  const { data: latestSnapshot, error: latestSnapshotError } = await supabase
    .from('price_snapshots')
    .select('price,shipping,stock_status,captured_at')
    .eq('offer_id', offerId)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestSnapshotError) {
    throw new Error(latestSnapshotError.message);
  }

  if (
    latestSnapshot &&
    String(latestSnapshot.captured_at).slice(0, 10) === today &&
    Number(latestSnapshot.price) === product.price &&
    (latestSnapshot.shipping == null ? null : Number(latestSnapshot.shipping)) === product.shipping &&
    String(latestSnapshot.stock_status ?? 'unknown') === product.stock_status
  ) {
    return false;
  }

  const { error } = await supabase.from('price_snapshots').insert({
    offer_id: offerId,
    price: product.price,
    shipping: product.shipping,
    stock_status: product.stock_status,
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

async function refreshCaches(supabase: SupabaseClient, setIds: string[]) {
  if (setIds.length === 0) {
    return;
  }

  const activeCutoff = getActiveCutoffIso();
  const today = getTodayDate();
  const { data, error } = await supabase
    .from('set_offers_with_latest')
    .select('set_id,country,offer_id,price,shipping,delivered_price,stock_status,last_seen_at')
    .in('set_id', setIds);

  if (error) {
    throw new Error(error.message);
  }

  const grouped = new Map<string, Record<'BE' | 'NL', {
    best_base_price: number | null;
    best_base_offer_id: string | null;
    best_delivered_price: number | null;
    best_delivered_offer_id: string | null;
  }>>();

  for (const setId of setIds) {
    grouped.set(setId, {
      BE: {
        best_base_price: null,
        best_base_offer_id: null,
        best_delivered_price: null,
        best_delivered_offer_id: null,
      },
      NL: {
        best_base_price: null,
        best_base_offer_id: null,
        best_delivered_price: null,
        best_delivered_offer_id: null,
      },
    });
  }

  for (const row of data ?? []) {
    const setId = String(row.set_id);
    const country = String(row.country) as 'BE' | 'NL';
    const current = grouped.get(setId);

    if (!current || !SUPPORTED_COUNTRIES.includes(country)) {
      continue;
    }

    const stockStatus = String(row.stock_status ?? 'unknown');
    const lastSeenAt = row.last_seen_at ? String(row.last_seen_at) : null;

    if (stockStatus === 'out_of_stock' || (lastSeenAt != null && lastSeenAt < activeCutoff)) {
      continue;
    }

    const price = row.price == null ? null : Number(row.price);
    const deliveredPrice = row.delivered_price == null ? computeDelivered(price, row.shipping == null ? null : Number(row.shipping)) : Number(row.delivered_price);
    const countryBest = current[country];

    if (price != null && (countryBest.best_base_price == null || price < countryBest.best_base_price)) {
      countryBest.best_base_price = price;
      countryBest.best_base_offer_id = String(row.offer_id);
    }

    if (
      deliveredPrice != null &&
      (countryBest.best_delivered_price == null || deliveredPrice < countryBest.best_delivered_price)
    ) {
      countryBest.best_delivered_price = deliveredPrice;
      countryBest.best_delivered_offer_id = String(row.offer_id);
    }
  }

  const bestPriceRows = Array.from(grouped.entries()).flatMap(([setId, countries]) =>
    SUPPORTED_COUNTRIES.map((country) => ({
      set_id: setId,
      country,
      best_base_price: countries[country].best_base_price,
      best_base_offer_id: countries[country].best_base_offer_id,
      best_delivered_price: countries[country].best_delivered_price,
      best_delivered_offer_id: countries[country].best_delivered_offer_id,
      updated_at: new Date().toISOString(),
    })),
  );

  const dailyRows = Array.from(grouped.entries()).flatMap(([setId, countries]) =>
    SUPPORTED_COUNTRIES.map((country) => ({
      set_id: setId,
      country,
      date: today,
      min_base_price: countries[country].best_base_price,
      min_delivered_price: countries[country].best_delivered_price,
    })),
  );

  const [bestPriceUpdate, dailyUpdate] = await Promise.all([
    supabase.from('set_best_prices_daily').upsert(bestPriceRows, {
      onConflict: 'set_id,country',
    }),
    supabase.from('set_price_daily').upsert(dailyRows, {
      onConflict: 'set_id,country,date',
    }),
  ]);

  if (bestPriceUpdate.error) {
    throw new Error(bestPriceUpdate.error.message);
  }

  if (dailyUpdate.error) {
    throw new Error(dailyUpdate.error.message);
  }
}

async function runSource(
  supabase: SupabaseClient,
  source: string,
  loadProducts: () => Promise<NormalizedProduct[]>,
  touchedSetIds: Set<string>,
) {
  const result: IngestionResult = {
    source,
    offers_processed: 0,
    snapshots_inserted: 0,
    matched_products: 0,
    queued_products: 0,
    errors: [],
  };

  const runId = await createRun(supabase, source);
  const resolveContext = {
    overrideCache: new Map<string, string | null>(),
    setNumCache: new Map<string, string | null>(),
    eanCache: new Map<string, string | null>(),
  };

  try {
    const products = await loadProducts();

    for (const product of products) {
      result.offers_processed += 1;

      try {
        const setId = await resolveSetId(supabase, product, resolveContext);

        if (!setId) {
          result.queued_products += 1;
          continue;
        }

        const offerId = await upsertOffer(supabase, product, setId);
        const insertedSnapshot = await insertSnapshotIfChanged(supabase, offerId, product);

        touchedSetIds.add(setId);
        result.matched_products += 1;
        if (insertedSnapshot) {
          result.snapshots_inserted += 1;
        }
      } catch (error) {
        result.errors.push(error instanceof Error ? error.message : 'Unknown product processing error');
      }
    }

    await finalizeRun(supabase, runId, result, result.errors.length > 0 ? 'error' : 'success');
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown source error');
    await finalizeRun(supabase, runId, result, 'error');
  }

  return result;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ingestionSecret = getIngestionSecret();
    if (ingestionSecret) {
      const headerSecret = request.headers.get('x-ingestion-secret') ?? '';
      if (headerSecret !== ingestionSecret) {
        return unauthorizedResponse();
      }
    }

    const supabase = createServiceRoleClient();
    const touchedSetIds = new Set<string>();
    const results: IngestionResult[] = [];

    for (const config of getBolFeedConfigs()) {
      results.push(
        await runSource(supabase, config.source, async () => {
          logger.info('Starting bol connector', { source: config.source });
          const download = await downloadBolFeed(config);
          const parsed = parseBolFeed(download.body, download.contentType, config);
          return normalizeBolProducts(parsed, config);
        }, touchedSetIds),
      );
    }

    for (const config of getAwinFeedConfigs()) {
      results.push(
        await runSource(supabase, config.source, async () => {
          logger.info('Starting awin connector', { source: config.source });
          const download = await downloadAwinFeed(config);
          const parsed = parseAwinFeed(download.body, download.contentType, config);
          return normalizeAwinProducts(parsed, config);
        }, touchedSetIds),
      );
    }

    if (getMockFeedEnabled()) {
      logger.info('MOCK_FEED=true — running mock connector instead of real feeds');
      results.push(
        await runSource(supabase, 'mock', () => generateMockProducts(supabase), touchedSetIds),
      );
    }

    await refreshCaches(supabase, Array.from(touchedSetIds));
    let alertResult:
      | Awaited<ReturnType<typeof runAlertsAfterIngest>>
      | { error: string }
      | null = null;

    try {
      alertResult = await runAlertsAfterIngest(supabase);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown alert evaluation error';
      logger.error('runAlertsAfterIngest failed at end of ingestion', {
        error: message,
      });
      alertResult = {
        error: message,
      };
    }

    return jsonResponse({
      sources: results,
      touched_set_count: touchedSetIds.size,
      alerts: alertResult,
    });
  } catch (error) {
    logger.error('ingest_daily_prices failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 },
    );
  }
});
