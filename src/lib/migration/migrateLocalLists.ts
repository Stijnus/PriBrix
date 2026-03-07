import { addToServerOwned } from '@/src/features/owned/api';
import { fetchSetsBySetNums } from '@/src/features/sets/api';
import { addToServerWatchlist } from '@/src/features/watchlist/api';
import { addToServerWishlist } from '@/src/features/wishlist/api';
import {
  clearLocalLists,
  getLocalOwned,
  getLocalWatchlist,
  getLocalWishlist,
} from '@/src/lib/storage/localLists';
import { markMigrationCompleted } from '@/src/lib/storage/authState';

export type MigrationResult = {
  migratedWatchlistCount: number;
  migratedWishlistCount: number;
  migratedOwnedCount: number;
  missingSetNums: string[];
};

export async function hasLocalListsToMigrate() {
  const [watchlist, wishlist, owned] = await Promise.all([
    getLocalWatchlist(),
    getLocalWishlist(),
    getLocalOwned(),
  ]);

  return watchlist.length > 0 || wishlist.length > 0 || owned.length > 0;
}

export async function migrateLocalLists(userId: string): Promise<MigrationResult> {
  const [watchlist, wishlist, owned] = await Promise.all([
    getLocalWatchlist(),
    getLocalWishlist(),
    getLocalOwned(),
  ]);

  const allSetNums = Array.from(
    new Set([...watchlist, ...wishlist, ...owned].map((item) => item.set_num)),
  );
  const resolvedSets = await fetchSetsBySetNums(allSetNums);
  const resolvedSetNums = new Set(resolvedSets.map((set) => set.set_num));
  const missingSetNums = allSetNums.filter((setNum) => !resolvedSetNums.has(setNum));

  let migratedWatchlistCount = 0;
  let migratedWishlistCount = 0;
  let migratedOwnedCount = 0;

  for (const item of watchlist) {
    if (!resolvedSetNums.has(item.set_num)) {
      continue;
    }

    await addToServerWatchlist(userId, item);
    migratedWatchlistCount += 1;
  }

  for (const item of wishlist) {
    if (!resolvedSetNums.has(item.set_num)) {
      continue;
    }

    await addToServerWishlist(userId, item);
    migratedWishlistCount += 1;
  }

  for (const item of owned) {
    if (!resolvedSetNums.has(item.set_num)) {
      continue;
    }

    await addToServerOwned(userId, item);
    migratedOwnedCount += 1;
  }

  await clearLocalLists();
  await markMigrationCompleted(userId);

  return {
    migratedWatchlistCount,
    migratedWishlistCount,
    migratedOwnedCount,
    missingSetNums,
  };
}
