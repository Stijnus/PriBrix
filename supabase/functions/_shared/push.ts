import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { logger } from './logger.ts';

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_CHUNK_SIZE = 100;

export type PushNotificationMessage = {
  eventId: string;
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export type PushNotificationResult = {
  eventId: string;
  token: string;
  ok: boolean;
  error?: string;
};

function chunkMessages<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export async function sendPushNotifications(
  supabase: SupabaseClient,
  messages: PushNotificationMessage[],
): Promise<PushNotificationResult[]> {
  if (messages.length === 0) {
    return [];
  }

  const results: PushNotificationResult[] = [];
  const invalidTokens = new Set<string>();

  for (const chunk of chunkMessages(messages, EXPO_PUSH_CHUNK_SIZE)) {
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        chunk.map((message) => ({
          to: message.token,
          title: message.title,
          body: message.body,
          data: message.data ?? {},
          channelId: 'price-alerts',
        })),
      ),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      logger.error('Expo push request failed', {
        status: response.status,
        responseBody,
      });

      results.push(
        ...chunk.map((message) => ({
          eventId: message.eventId,
          token: message.token,
          ok: false,
          error: `expo_request_failed_${response.status}`,
        })),
      );

      continue;
    }

    const payload = (await response.json()) as {
      data?: Array<{
        status?: string;
        id?: string;
        message?: string;
        details?: { error?: string };
      }>;
    };

    const tickets = payload.data ?? [];

    for (const [index, message] of chunk.entries()) {
      const ticket = tickets[index];
      const ticketError = ticket?.details?.error ?? ticket?.message;

      if (ticket?.status === 'ok') {
        results.push({
          eventId: message.eventId,
          token: message.token,
          ok: true,
        });
        continue;
      }

      if (ticket?.details?.error === 'DeviceNotRegistered') {
        invalidTokens.add(message.token);
      }

      results.push({
        eventId: message.eventId,
        token: message.token,
        ok: false,
        error: ticketError ?? 'unknown_push_error',
      });
    }
  }

  if (invalidTokens.size > 0) {
    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .in('expo_push_token', Array.from(invalidTokens));

    if (error) {
      logger.warn('Failed to remove invalid push tokens', {
        error: error.message,
        invalidTokenCount: invalidTokens.size,
      });
    }
  }

  return results;
}
