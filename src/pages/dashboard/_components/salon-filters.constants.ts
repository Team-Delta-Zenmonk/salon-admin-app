export const TIER_OPTIONS = [
  { value: "all", label: "All Tiers" },
  { value: "trial", label: "Free Trial" },
  { value: "monthly", label: "Monthly Plan" },
  { value: "yearly", label: "Yearly Plan" },
] as const;

export const STATUS_OPTIONS = [
  { value: "trial", label: "Active Trials" },
  { value: "active", label: "Subscribed / Active" },
  { value: "expired", label: "Expired" },
  { value: "suspended", label: "Suspended" },
] as const;

