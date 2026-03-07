import { downloadFeed } from '../common.ts';
import type { AwinFeedConfig } from '../../types.ts';

export async function downloadAwinFeed(config: AwinFeedConfig) {
  return downloadFeed(config.url, config.headers);
}
