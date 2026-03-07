import { downloadFeed } from '../common.ts';
import type { BolFeedConfig } from '../../types.ts';

export async function downloadBolFeed(config: BolFeedConfig) {
  return downloadFeed(config.url, config.headers);
}
