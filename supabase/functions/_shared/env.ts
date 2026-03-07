import type { AwinFeedConfig, BolFeedConfig, FeedFieldMap, FeedFormat } from './types.ts';

function getEnv(name: string) {
  return Deno.env.get(name)?.trim() ?? '';
}

function parseJsonEnv<T>(name: string, fallback: T): T {
  const raw = getEnv(name);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${name}: ${error instanceof Error ? error.message : 'parse error'}`);
  }
}

function normalizeFormat(value: unknown): FeedFormat {
  if (value === 'csv' || value === 'json' || value === 'xml' || value === 'auto') {
    return value;
  }

  return 'auto';
}

function normalizeFieldMap(value: unknown): FeedFieldMap {
  return typeof value === 'object' && value != null ? (value as FeedFieldMap) : {};
}

function normalizeHeaders(value: unknown) {
  if (typeof value !== 'object' || value == null) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, String(entry)]),
  );
}

export function getIngestionSecret() {
  return getEnv('INGESTION_SECRET');
}

export function getBolFeedConfigs(): BolFeedConfig[] {
  const configs = parseJsonEnv<Array<Record<string, unknown>>>('BOL_FEEDS_JSON', []);

  return configs
    .map((config) => ({
      source: String(config.source ?? 'bol'),
      url: String(config.url ?? ''),
      format: normalizeFormat(config.format),
      retailerId: String(config.retailerId ?? config.retailer_id ?? ''),
      headers: normalizeHeaders(config.headers),
      fieldMap: normalizeFieldMap(config.fieldMap),
      recordsPath: config.recordsPath ? String(config.recordsPath) : undefined,
    }))
    .filter((config) => config.url.length > 0 && config.retailerId.length > 0);
}

export function getAwinFeedConfigs(): AwinFeedConfig[] {
  const configs = parseJsonEnv<Array<Record<string, unknown>>>('AWIN_FEEDS_JSON', []);

  return configs
    .map((config) => ({
      source: String(config.source ?? 'awin'),
      url: String(config.url ?? ''),
      format: normalizeFormat(config.format),
      headers: normalizeHeaders(config.headers),
      fieldMap: normalizeFieldMap(config.fieldMap),
      recordsPath: config.recordsPath ? String(config.recordsPath) : undefined,
      merchantRetailerMap:
        typeof config.merchantRetailerMap === 'object' && config.merchantRetailerMap != null
          ? Object.fromEntries(
              Object.entries(config.merchantRetailerMap as Record<string, unknown>).map(([key, value]) => [
                key,
                String(value),
              ]),
            )
          : {},
    }))
    .filter((config) => config.url.length > 0 && Object.keys(config.merchantRetailerMap).length > 0);
}
