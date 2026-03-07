import { normalizeProductFields } from '../common.ts';
import type { AwinFeedConfig, NormalizedProduct, RawConnectorProduct } from '../../types.ts';

export function normalizeAwinProducts(
  records: RawConnectorProduct[],
  config: AwinFeedConfig,
): NormalizedProduct[] {
  return records
    .map((record) => {
      const fields = normalizeProductFields(record, config.fieldMap);
      const retailerId = config.merchantRetailerMap[fields.merchantId];

      if (!retailerId || !fields.sourceProductId || !fields.title || !fields.productUrl || fields.price == null) {
        return null;
      }

      return {
        source: config.source,
        retailer_id: retailerId,
        source_product_id: fields.sourceProductId,
        title: fields.title,
        ean: fields.ean,
        price: fields.price,
        shipping: fields.shipping,
        stock_status: fields.stockStatus,
        product_url: fields.productUrl,
      } satisfies NormalizedProduct;
    })
    .filter((product): product is NormalizedProduct => product != null);
}
