import type { Alert, AlertEventHistoryItem } from '@/src/lib/validation/alerts';

export type AlertType = Alert['type'];
export type AlertConfigType = AlertType;

export type UpsertAlertInput = {
  watchId: string;
  type: AlertConfigType;
  thresholdPrice?: number;
  thresholdPercent?: number;
  isEnabled?: boolean;
  cooldownHours?: number;
};

export type UpdateAlertInput = {
  alertId: string;
  thresholdPrice?: number | null;
  thresholdPercent?: number | null;
  isEnabled?: boolean;
  cooldownHours?: number;
};

export type AlertHistoryItem = AlertEventHistoryItem;
