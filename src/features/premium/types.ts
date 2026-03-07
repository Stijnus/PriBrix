export type PlanName = 'free' | 'premium';
export type PlanStatus = 'active' | 'past_due' | 'canceled';
export type ResolvedPlanName = 'free' | 'premium';

export type UserPlan = {
  userId: string | null;
  plan: PlanName;
  status: PlanStatus;
  provider: string | null;
  currentPeriodEnd: string | null;
  resolvedPlan: ResolvedPlanName;
  isPremium: boolean;
  isExpired: boolean;
  isPastDue: boolean;
};

export type Entitlements = {
  watchlistLimit: number | null;
  historyDays: 30 | 365;
  alertsPerSet: number | null;
  alertTypes: readonly string[];
};
