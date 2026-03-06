import type { RebrickableListResponse, RebrickableSet, RebrickableTheme } from './types';

const REBRICKABLE_API_BASE_URL = 'https://rebrickable.com/api/v3/lego';
const RATE_LIMIT_DELAY_MS = 1100;

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getApiKey() {
  const apiKey = process.env.REBRICKABLE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing REBRICKABLE_API_KEY. Add it to .env before running the catalog import.');
  }

  return apiKey;
}

async function requestPage<T>(path: string, page: number): Promise<RebrickableListResponse<T>> {
  const apiKey = getApiKey();
  const url = new URL(`${REBRICKABLE_API_BASE_URL}${path}`);

  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', '1000');

  const response = await fetch(url, {
    headers: {
      Authorization: `key ${apiKey}`,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Rebrickable request failed (${response.status}) for ${url}: ${details}`);
  }

  return (await response.json()) as RebrickableListResponse<T>;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let nextPageExists = true;

  while (nextPageExists) {
    const payload = await requestPage<T>(path, page);
    results.push(...payload.results);
    nextPageExists = payload.next !== null;
    page += 1;

    if (nextPageExists) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  return results;
}

export async function fetchThemes(): Promise<RebrickableTheme[]> {
  return fetchAllPages<RebrickableTheme>('/themes/');
}

export async function fetchSets(): Promise<RebrickableSet[]> {
  return fetchAllPages<RebrickableSet>('/sets/');
}
