import type { SalonItem } from "@/features/salons";
import type { BadgeProps } from "@/components/ui/badge";
import { getDaysRemaining } from "@/lib/utils";

export const isSalonSuspended = (salon: SalonItem): boolean => {
  return !salon.is_active || salon.subscription_status === "suspended";
};

export const getSalonStatusBadgeVariant = (salon: SalonItem): BadgeProps["variant"] => {
  if (isSalonSuspended(salon)) return "default";

  const now = new Date();
  const planStillActive = salon.subscription_expires_at && new Date(salon.subscription_expires_at) > now;
  const trialStillActive = salon.trial_ends_at && new Date(salon.trial_ends_at) > now;

  if (!salon.subscription_expires_at && !salon.trial_ends_at) {
    if (salon.subscription_status === "active") return "active";
    if (salon.subscription_status === "trial") return "trial";
    return "expired";
  }

  if (!planStillActive && !trialStillActive) return "expired";
  if (planStillActive) return "active";
  return "trial";
};

export const getSalonExpiryCountdown = (salon: SalonItem) => {
  const isPaid = salon.subscription_plan && salon.subscription_plan !== "trial";
  const hasPlanExpiry = Boolean(salon.subscription_expires_at);
  const hasTrialExpiry = Boolean(salon.trial_ends_at);

  const targetDate = isPaid && hasPlanExpiry
    ? salon.subscription_expires_at
    : salon.trial_ends_at || salon.subscription_expires_at;

  const isTrackingPlan = Boolean((isPaid && hasPlanExpiry) || (!hasTrialExpiry && hasPlanExpiry));

  const primaryCountdown = getDaysRemaining(targetDate);
  const isSuspended = isSalonSuspended(salon);

  return {
    targetDate,
    countdown: primaryCountdown,
    isSuspended,
    isTrackingPlan,
    primaryLabel: isTrackingPlan ? "Plan" : "Trial",
    trialEndsAt: salon.trial_ends_at,
    planExpiresAt: salon.subscription_expires_at,
    hasCombinedExpiry: Boolean(isPaid && hasPlanExpiry && hasTrialExpiry),
  };
};

