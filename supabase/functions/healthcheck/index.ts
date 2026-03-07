import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceRoleClient } from '../_shared/supabaseClient.ts';

type SourceStatus = {
  name: string;
  last_run: string | null;
  status: string | null;
  offers_processed: number;
};

function getOverallStatus(sources: SourceStatus[]) {
  if (sources.length === 0) {
    return 'degraded';
  }

  if (sources.some((source) => source.status === 'error')) {
    return 'unhealthy';
  }

  if (sources.some((source) => source.status !== 'success')) {
    return 'degraded';
  }

  return 'healthy';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('ingestion_runs')
      .select('source,started_at,status,offers_processed')
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const latestBySource = new Map<string, SourceStatus>();

    for (const row of data ?? []) {
      const source = String(row.source);
      if (latestBySource.has(source)) {
        continue;
      }

      latestBySource.set(source, {
        name: source,
        last_run: row.started_at ? String(row.started_at) : null,
        status: row.status ? String(row.status) : null,
        offers_processed: row.offers_processed == null ? 0 : Number(row.offers_processed),
      });
    }

    const sources = Array.from(latestBySource.values());

    return jsonResponse({
      status: getOverallStatus(sources),
      sources,
    });
  } catch (error) {
    return jsonResponse(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unexpected error',
        sources: [],
      },
      { status: 500 },
    );
  }
});
