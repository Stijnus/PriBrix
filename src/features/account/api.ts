import { z } from 'zod';

import { supabase } from '@/src/lib/supabase/client';

import type { DeleteAccountInput, DeleteAccountResult } from './types';

const DeleteAccountResponseSchema = z.object({
  deleted: z.literal(true),
  user_id: z.string().uuid(),
});

export async function deleteAccount(input: DeleteAccountInput): Promise<DeleteAccountResult> {
  const { data, error } = await supabase.functions.invoke('delete_user_data', {
    body: {
      confirm_email: input.confirmEmail,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const parsed = DeleteAccountResponseSchema.parse(data);

  return {
    deleted: true,
    userId: parsed.user_id,
  };
}
