import type { SalonItem } from "@/features/salons";
import type { BadgeProps } from "@/components/ui/badge";
import { getDaysRemaining } from "@/lib/utils";

export const isSalonSuspended = (salon: SalonItem): boolean => {
  return !salon.is_active || salon.subscription_status === "suspended";
};

export const getSalonStatusBadgeVariant = (salon: SalonItem): BadgeProps["variant"] => {
  if (isSalonSuspended(salon)) return "suspended";
  if (salon.subscription_status === "active") return "active";
  if (salon.subscription_status === "trial") return "trial";
  return "expired";
};

export const getSalonExpiryCountdown = (salon: SalonItem) => {
  const targetDate =
    salon.subscription_status === "trial"
      ? salon.trial_ends_at
      : salon.subscription_expires_at;
  const countdown = getDaysRemaining(targetDate);
  const isSuspended = isSalonSuspended(salon);

  return { targetDate, countdown, isSuspended };
};

