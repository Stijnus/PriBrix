import { z } from 'npm:zod@4.1.8';

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceRoleClient } from '../_shared/supabaseClient.ts';

const DeleteUserDataInputSchema = z.object({
  confirm_email: z.string().trim().email(),
});

const DeleteUserDataOutputSchema = z.object({
  deleted: z.literal(true),
  user_id: z.string().uuid(),
});

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, { status: 405 });
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing bearer token.' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const accessToken = authorization.replace('Bearer ', '').trim();
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return jsonResponse({ error: 'Invalid session.' }, { status: 401 });
  }

  let input: z.infer<typeof DeleteUserDataInputSchema>;

  try {
    input = DeleteUserDataInputSchema.parse(await request.json());
  } catch (error) {
    return jsonResponse(
      {
        error: 'Invalid request body.',
        details: error instanceof Error ? error.message : 'Unknown validation error.',
      },
      { status: 400 },
    );
  }

  const userEmail = authData.user.email?.trim().toLowerCase();

  if (!userEmail || input.confirm_email.trim().toLowerCase() !== userEmail) {
    return jsonResponse({ error: 'Confirmation email does not match the signed-in account.' }, { status: 400 });
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);

  if (deleteError) {
    return jsonResponse({ error: deleteError.message }, { status: 500 });
  }

  return jsonResponse(DeleteUserDataOutputSchema.parse({ deleted: true, user_id: authData.user.id }));
});
