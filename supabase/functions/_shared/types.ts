export type StockStatus = 'in_stock' | 'out_of_stock' | 'unknown';
export type FeedFormat = 'auto' | 'csv' | 'json' | 'xml';

export type FeedFieldMap = {
  source_product_id?: string;
  title?: string;
  ean?: string;
  price?: string;
  shipping?: string;
  stock_status?: string;
  product_url?: string;
  category?: string;
  brand?: string;
  merchant_id?: string;
};

export type BolFeedConfig = {
  source: string;
  url: string;
  format: FeedFormat;
  retailerId: string;
  headers: Record<string, string>;
  fieldMap: FeedFieldMap;
  recordsPath?: string;
};

export type AwinFeedConfig = {
  source: string;
  url: string;
  format: FeedFormat;
  headers: Record<string, string>;
  fieldMap: FeedFieldMap;
  recordsPath?: string;
  merchantRetailerMap: Record<string, string>;
};

export type RawConnectorProduct = Record<string, unknown>;

export type NormalizedProduct = {
  source: string;
  retailer_id: string;
  source_product_id: string;
  title: string;
  ean: string | null;
  price: number | null;
  shipping: number | null;
  stock_status: StockStatus;
  product_url: string;
};

export type IngestionResult = {
  source: string;
  offers_processed: number;
  snapshots_inserted: number;
  matched_products: number;
  queued_products: number;
  errors: string[];
};
