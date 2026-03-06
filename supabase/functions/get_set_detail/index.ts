import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceRoleClient } from '../_shared/supabaseClient.ts';
import { GetSetDetailInputSchema } from './types.ts';

const ACTIVE_OFFER_WINDOW_DAYS = 7;

function getIsoDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function getIsoTimestampDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function coerceNumeric(value: unknown) {
  return value == null ? null : Number(value);
}

function isOfferActive(offer: { stock_status: string | null; last_seen_at: string | null }, cutoffIso: string) {
  if (offer.stock_status !== 'out_of_stock') {
    return true;
  }

  return offer.last_seen_at != null && offer.last_seen_at >= cutoffIso;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const rawBody = await request.json().catch(() => ({}));
    const parsedInput = GetSetDetailInputSchema.safeParse(rawBody);

    if (!parsedInput.success) {
      return jsonResponse(
        {
          error: 'Invalid input.',
          details: parsedInput.error.flatten(),
        },
        { status: 400 },
      );
    }

    const input = parsedInput.data;
    const supabase = createServiceRoleClient();

    const { data: setRow, error: setError } = await supabase
      .from('sets')
      .select('*')
      .eq('set_num', input.set_num)
      .maybeSingle();

    if (setError) {
      throw setError;
    }

    if (!setRow) {
      return jsonResponse({ error: `Set ${input.set_num} was not found.` }, { status: 404 });
    }

    const activeOfferCutoff = getIsoTimestampDaysAgo(ACTIVE_OFFER_WINDOW_DAYS);
    const historyStartDate = getIsoDateDaysAgo(input.include_history_days);

    const [offersResponse, bestPricesResponse, historyResponse] = await Promise.all([
      (input.country === '*'
        ? supabase.from('set_offers_with_latest').select('*').eq('set_id', setRow.id)
        : supabase
            .from('set_offers_with_latest')
            .select('*')
            .eq('set_id', setRow.id)
            .eq('country', input.country)).order('price', {
        ascending: true,
        nullsFirst: false,
      }),
      supabase.from('set_best_prices_daily').select('*').eq('set_id', setRow.id),
      input.country === '*'
        ? Promise.resolve({ data: [], error: null })
        : supabase
            .from('set_price_daily')
            .select('*')
            .eq('set_id', setRow.id)
            .eq('country', input.country)
            .gte('date', historyStartDate)
            .order('date', { ascending: true }),
    ]);

    if (offersResponse.error) {
      throw offersResponse.error;
    }

    if (bestPricesResponse.error) {
      throw bestPricesResponse.error;
    }

    if (historyResponse.error) {
      throw historyResponse.error;
    }

    const offers = (offersResponse.data ?? [])
      .map((row) => ({
        offer_id: String(row.offer_id),
        set_id: String(row.set_id),
        retailer_name: String(row.retailer_name),
        country: row.country === 'NL' ? 'NL' : 'BE',
        product_url: String(row.product_url),
        title_raw: String(row.title_raw ?? ''),
        ean: row.ean ? String(row.ean) : null,
        price: coerceNumeric(row.price),
        shipping: coerceNumeric(row.shipping),
        delivered_price: coerceNumeric(row.delivered_price),
        stock_status: row.stock_status ? String(row.stock_status) : 'unknown',
        captured_at: row.captured_at ? String(row.captured_at) : null,
        last_seen_at: row.last_seen_at ? String(row.last_seen_at) : null,
      }))
      .filter((offer) => isOfferActive(offer, activeOfferCutoff));

    const bestPrices = Object.fromEntries(
      (bestPricesResponse.data ?? []).map((row) => [
        String(row.country),
        {
          best_base_price: coerceNumeric(row.best_base_price),
          best_base_offer_id: row.best_base_offer_id ? String(row.best_base_offer_id) : null,
          best_delivered_price: coerceNumeric(row.best_delivered_price),
          best_delivered_offer_id: row.best_delivered_offer_id ? String(row.best_delivered_offer_id) : null,
        },
      ]),
    );

    const priceHistory = (historyResponse.data ?? []).map((row) => ({
      date: String(row.date).slice(0, 10),
      min_base_price: coerceNumeric(row.min_base_price),
      min_delivered_price: coerceNumeric(row.min_delivered_price),
    }));

    return jsonResponse({
      set: {
        id: String(setRow.id),
        set_num: String(setRow.set_num),
        name: String(setRow.name),
        theme: String(setRow.theme),
        year: Number(setRow.year),
        image_url: setRow.image_url ? String(setRow.image_url) : null,
        msrp_eur: coerceNumeric(setRow.msrp_eur),
      },
      offers,
      best_prices: bestPrices,
      price_history: priceHistory,
    });
  } catch (error) {
    console.error('get_set_detail failed', error);

    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonResponse({ error: message }, { status: 500 });
  }
});
