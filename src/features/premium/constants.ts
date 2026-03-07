import type { AlertType } from '@/src/features/alerts/types';

export const FREE_WATCHLIST_LIMIT = 20;
export const FREE_HISTORY_DAYS = 30;
export const FREE_ALERTS_PER_SET = 1;
export const PREMIUM_HISTORY_DAYS = 365;

export const FREE_ALERT_TYPES: AlertType[] = ['below_base_price'];
export const PREMIUM_ALERT_TYPES: AlertType[] = [
  'below_base_price',
  'below_delivered_price',
  'percent_drop_30d',
  'lowest_90d',
];
