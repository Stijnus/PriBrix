import type { LocalOwnedItem, LocalWatchItem, LocalWishlistItem } from '@/src/lib/validation/lists';

export const watchlistFixture: LocalWatchItem[] = [
  { set_num: '10316-1', country: 'BE', target_base_price: 429.99 },
  { set_num: '75331-1', country: 'NL', target_base_price: 499.99 },
  { set_num: '60439-1', country: '*', target_base_price: 28.99 },
];

export const wishlistFixture: LocalWishlistItem[] = [
  { set_num: '21348-1', priority: 'high', target_base_price: 319.99 },
  { set_num: '76269-1', priority: 'medium' },
];

export const ownedFixture: LocalOwnedItem[] = [
  { set_num: '31152-1', quantity: 1, condition: 'sealed', purchase_price: 44.99 },
  { set_num: '71411-1', quantity: 1, condition: 'used', notes: 'Built once, complete with box.' },
];
