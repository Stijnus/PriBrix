import type { NormalizedSet, RebrickableSet, RebrickableTheme } from './types';

// Root themes that are non-retail (gear, books, educational, promotional, etc.)
// These are excluded from the PriBrix catalog — not sold as buildable sets in BE/NL retail.
const EXCLUDED_ROOT_THEMES = new Set([
  'Gear',
  'Books',
  'Educational and Dacta',
  'Service Packs',
  'Promotional',
  'Legoland',
  'Legoland Parks',
  'FIRST LEGO League',
  'Modulex',
]);

function resolveThemePath(themeId: number, themeMap: Map<number, RebrickableTheme>) {
  const path: string[] = [];
  const visited = new Set<number>();
  let currentTheme = themeMap.get(themeId);

  while (currentTheme) {
    if (visited.has(currentTheme.id)) {
      break;
    }

    visited.add(currentTheme.id);
    path.unshift(currentTheme.name);

    if (currentTheme.parent_id == null) {
      break;
    }

    currentTheme = themeMap.get(currentTheme.parent_id);
  }

  return path.join(' > ');
}

export function buildThemeMap(themes: RebrickableTheme[]) {
  return new Map(themes.map((theme) => [theme.id, theme]));
}

export function normalizeSets(
  sets: RebrickableSet[],
  themeMap: Map<number, RebrickableTheme>,
): NormalizedSet[] {
  const dedupedSets = new Map<string, NormalizedSet>();

  for (const set of sets) {
    if (!set.set_num || !set.name || !set.year) {
      continue;
    }

    const themePath = resolveThemePath(set.theme_id, themeMap) || 'Unknown';
    const rootTheme = themePath.split(' > ')[0];
    if (EXCLUDED_ROOT_THEMES.has(rootTheme)) {
      continue;
    }

    dedupedSets.set(set.set_num, {
      set_num: set.set_num,
      name: set.name,
      theme: themePath,
      year: set.year,
      image_url: set.set_img_url,
      msrp_eur: null,
    });
  }

  return Array.from(dedupedSets.values());
}
