import type { Alert, AlertEventHistoryItem } from '@/src/lib/validation/alerts';

export type AlertConfigType = Extract<Alert['type'], 'below_base_price'>;

export type UpsertAlertInput = {
  watchId: string;
  type: AlertConfigType;
  thresholdPrice: number;
  isEnabled?: boolean;
  cooldownHours?: number;
};

export type UpdateAlertInput = {
  alertId: string;
  thresholdPrice?: number;
  isEnabled?: boolean;
  cooldownHours?: number;
};

export type AlertHistoryItem = AlertEventHistoryItem;
