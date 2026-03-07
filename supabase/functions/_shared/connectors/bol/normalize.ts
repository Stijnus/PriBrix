import { normalizeProductFields } from '../common.ts';
import type { BolFeedConfig, NormalizedProduct, RawConnectorProduct } from '../../types.ts';

export function normalizeBolProducts(
  records: RawConnectorProduct[],
  config: BolFeedConfig,
): NormalizedProduct[] {
  return records
    .map((record) => {
      const fields = normalizeProductFields(record, config.fieldMap);

      if (!fields.sourceProductId || !fields.title || !fields.productUrl || fields.price == null) {
        return null;
      }

      return {
        source: config.source,
        retailer_id: config.retailerId,
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
