import path from 'node:path';

import { getBricksetEnrichmentStub } from './brickset';
import { buildThemeMap, normalizeSets } from './normalize';
import { fetchSets, fetchThemes } from './rebrickable';
import type { ImportOptions } from './types';
import { upsertSets } from './upsert';

function loadLocalEnv() {
  if (typeof process.loadEnvFile !== 'function') {
    return;
  }

  const envPath = path.resolve(process.cwd(), '.env');
  process.loadEnvFile(envPath);
}

function parseArgs(argv: string[]): ImportOptions {
  const options: ImportOptions = {
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (argument === '--year-min') {
      const rawValue = argv[index + 1];
      const parsedValue = Number(rawValue);

      if (!rawValue || Number.isNaN(parsedValue)) {
        throw new Error('Expected a numeric value after --year-min');
      }

      options.yearMin = parsedValue;
      index += 1;
    }
  }

  return options;
}

async function main() {
  loadLocalEnv();

  const options = parseArgs(process.argv.slice(2));

  const themes = await fetchThemes();
  const sets = await fetchSets();
  const themeMap = buildThemeMap(themes);
  const normalizedSets = normalizeSets(sets, themeMap);
  const filteredSets = normalizedSets.filter((set) => {
    if (options.yearMin == null) {
      return true;
    }

    return set.year >= options.yearMin;
  });
  const skipped = sets.length - filteredSets.length;

  const stats = await upsertSets(filteredSets, options.dryRun);
  const enrichment = getBricksetEnrichmentStub();

  console.log(
    JSON.stringify(
      {
        source: 'rebrickable',
        options,
        themesFetched: themes.length,
        setsFetched: sets.length,
        normalized: normalizedSets.length,
        inserted: stats.inserted,
        updated: stats.updated,
        skipped,
        dryRun: options.dryRun,
        bricksetEnrichment: enrichment,
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown import error';
    console.error(message);
    process.exitCode = 1;
  });
