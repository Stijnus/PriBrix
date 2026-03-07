import { looksLikeLegoProduct, parseFeedRecords } from '../common.ts';
import type { BolFeedConfig } from '../../types.ts';

export function parseBolFeed(
  body: string,
  contentType: string,
  config: BolFeedConfig,
) {
  return parseFeedRecords(body, config.format, contentType, config.recordsPath, config.url).filter((record) =>
    looksLikeLegoProduct(record, config.fieldMap)
  );
}
