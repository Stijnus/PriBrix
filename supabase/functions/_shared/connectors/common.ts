import Papa from 'npm:papaparse@5.5.3';
import { XMLParser } from 'npm:fast-xml-parser@4.5.3';

import type { FeedFieldMap, FeedFormat, RawConnectorProduct, StockStatus } from '../types.ts';
import { normalizeCurrency } from '../pricing/normalizeCurrency.ts';

export async function downloadFeed(url: string, headers: Record<string, string>) {
  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Feed download failed with status ${response.status}`);
  }

  return {
    contentType: response.headers.get('content-type') ?? '',
    body: await response.text(),
  };
}

function getByPath(record: Record<string, unknown>, path: string | undefined) {
  if (!path) {
    return undefined;
  }

  return path.split('.').reduce<unknown>((current, part) => {
    if (typeof current !== 'object' || current == null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[part];
  }, record);
}

function normalizeRecordArray(value: unknown): RawConnectorProduct[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is RawConnectorProduct => typeof entry === 'object' && entry != null);
  }

  if (typeof value === 'object' && value != null) {
    return [value as RawConnectorProduct];
  }

  return [];
}

function inferFormat(format: FeedFormat, contentType: string, url = ''): Exclude<FeedFormat, 'auto'> {
  if (format !== 'auto') {
    return format;
  }

  const normalized = `${contentType} ${url}`.toLowerCase();

  if (normalized.includes('json')) {
    return 'json';
  }

  if (normalized.includes('xml')) {
    return 'xml';
  }

  return 'csv';
}

export function parseFeedRecords(
  body: string,
  format: FeedFormat,
  contentType: string,
  recordsPath?: string,
  sourceUrl?: string,
) {
  const resolvedFormat = inferFormat(format, contentType, sourceUrl);

  if (resolvedFormat === 'json') {
    const parsed = JSON.parse(body) as unknown;
    const records = recordsPath && typeof parsed === 'object' && parsed != null
      ? normalizeRecordArray(getByPath(parsed as Record<string, unknown>, recordsPath))
      : normalizeRecordArray(parsed);
    return records;
  }

  if (resolvedFormat === 'xml') {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const parsed = parser.parse(body) as Record<string, unknown>;
    const records = recordsPath ? normalizeRecordArray(getByPath(parsed, recordsPath)) : normalizeRecordArray(parsed);
    return records;
  }

  const parsed = Papa.parse<Record<string, unknown>>(body, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse failed: ${parsed.errors[0]?.message ?? 'unknown error'}`);
  }

  return parsed.data.map((row) => row as RawConnectorProduct);
}

export function getMappedValue(record: RawConnectorProduct, fieldMap: FeedFieldMap, key: keyof FeedFieldMap) {
  const mappedKey = fieldMap[key];

  if (!mappedKey) {
    return undefined;
  }

  return getByPath(record, mappedKey);
}

export function looksLikeLegoProduct(record: RawConnectorProduct, fieldMap: FeedFieldMap) {
  const values = [
    getMappedValue(record, fieldMap, 'brand'),
    getMappedValue(record, fieldMap, 'title'),
    getMappedValue(record, fieldMap, 'category'),
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return values.some((value) => value.includes('lego'));
}

export function normalizeStockStatus(value: unknown): StockStatus {
  if (typeof value === 'boolean') {
    return value ? 'in_stock' : 'out_of_stock';
  }

  const normalized = String(value ?? '').trim().toLowerCase();

  if (!normalized) {
    return 'unknown';
  }

  if (
    normalized.includes('in stock') ||
    normalized.includes('op voorraad') ||
    normalized.includes('available') ||
    normalized === '1' ||
    normalized === 'true'
  ) {
    return 'in_stock';
  }

  if (
    normalized.includes('out of stock') ||
    normalized.includes('niet op voorraad') ||
    normalized.includes('unavailable') ||
    normalized.includes('sold out') ||
    normalized === '0' ||
    normalized === 'false'
  ) {
    return 'out_of_stock';
  }

  return 'unknown';
}

export function normalizeProductFields(record: RawConnectorProduct, fieldMap: FeedFieldMap) {
  return {
    sourceProductId: String(
      getMappedValue(record, fieldMap, 'source_product_id') ??
        getMappedValue(record, fieldMap, 'product_url') ??
        '',
    ).trim(),
    title: String(getMappedValue(record, fieldMap, 'title') ?? '').trim(),
    ean: (() => {
      const value = getMappedValue(record, fieldMap, 'ean');
      const normalized = value == null ? '' : String(value).trim();
      return normalized.length > 0 ? normalized : null;
    })(),
    price: normalizeCurrency(getMappedValue(record, fieldMap, 'price')),
    shipping: normalizeCurrency(getMappedValue(record, fieldMap, 'shipping')),
    stockStatus: normalizeStockStatus(getMappedValue(record, fieldMap, 'stock_status')),
    productUrl: String(getMappedValue(record, fieldMap, 'product_url') ?? '').trim(),
    merchantId: String(getMappedValue(record, fieldMap, 'merchant_id') ?? '').trim(),
  };
}
