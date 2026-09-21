export const SUBSCRIPTION_PLAN = {
  TRIAL: "trial",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];

export const SUBSCRIPTION_STATUS = {
  TRIAL: "trial",
  ACTIVE: "active",
  EXPIRED: "expired",
  SUSPENDED: "suspended",
  PENDING_PAYMENT: "pending_payment",
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const SubscriptionStatusOptions = [
  { label: "Trial", value: SUBSCRIPTION_STATUS.TRIAL },
  { label: "Active", value: SUBSCRIPTION_STATUS.ACTIVE },
  { label: "Expired", value: SUBSCRIPTION_STATUS.EXPIRED },
  { label: "Suspended", value: SUBSCRIPTION_STATUS.SUSPENDED },
  { label: "Pending Payment", value: SUBSCRIPTION_STATUS.PENDING_PAYMENT },
];
