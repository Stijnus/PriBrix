import { looksLikeLegoProduct, parseFeedRecords } from '../common.ts';
import type { AwinFeedConfig } from '../../types.ts';

export function parseAwinFeed(
  body: string,
  contentType: string,
  config: AwinFeedConfig,
) {
  return parseFeedRecords(body, config.format, contentType, config.recordsPath, config.url).filter((record) =>
    looksLikeLegoProduct(record, config.fieldMap)
  );
}
