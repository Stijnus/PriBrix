import { z } from 'npm:zod@3.24.1';

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { getIngestionSecret } from '../_shared/env.ts';
import { logger } from '../_shared/logger.ts';
import { createServiceRoleClient } from '../_shared/supabaseClient.ts';
import { runAlertsAfterIngest } from '../_shared/alerts/runAlerts.ts';

const RunAlertsRequestSchema = z.object({}).passthrough();
const RunAlertsResponseSchema = z.object({
  evaluated_count: z.number().int().nonnegative(),
  triggered_count: z.number().int().nonnegative(),
  push_attempt_count: z.number().int().nonnegative(),
  push_success_count: z.number().int().nonnegative(),
});

function unauthorizedResponse() {
  return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
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

    const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
    RunAlertsRequestSchema.parse(body);

    const result = await runAlertsAfterIngest(createServiceRoleClient());
    const response = RunAlertsResponseSchema.parse(result);

    return jsonResponse(response);
  } catch (error) {
    logger.error('run_alerts_after_ingest failed', {
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
