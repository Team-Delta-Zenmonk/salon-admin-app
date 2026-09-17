import React, { useState } from "react";
import dayjs from "dayjs";
import { Zap, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { SalonItem } from "@/features/salons/list-salons/list-salons.service";
import { useAppDispatch } from "@/store/hooks";
import { updateSalonPlanAction } from "@/features/salons/update-salon-plan/update-salon-plan.action";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS, type SubscriptionPlan } from "@/common/enums/subscription.enum";

interface OverridePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: SalonItem | null;
}

export const OverridePlanModal: React.FC<OverridePlanModalProps> = ({
  isOpen,
  onClose,
  salon,
}) => {
  const dispatch = useAppDispatch();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    salon?.subscription_plan === SUBSCRIPTION_PLAN.YEARLY ? SUBSCRIPTION_PLAN.YEARLY : SUBSCRIPTION_PLAN.MONTHLY
  );
  const [durationDays, setDurationDays] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!salon) return null;

  const planTiers: {
    id: SubscriptionPlan;
    name: string;
    price: string;
    features: string;
  }[] = [
    {
      id: SUBSCRIPTION_PLAN.MONTHLY,
      name: "Monthly Plan",
      price: "₹2,499 / mo",
      features: "Unlimited staff & bookings, POS, analytics, SMS alerts",
    },
    {
      id: SUBSCRIPTION_PLAN.YEARLY,
      name: "Yearly Plan",
      price: "₹24,990 / yr",
      features: "Save ~20% (2 Months Free), priority onboarding & dedicated support",
    },
  ];

  const durationOptions = [
    { label: "1 Month (+30d)", days: 30 },
    { label: "3 Months (+90d)", days: 90 },
    { label: "6 Months (+180d)", days: 180 },
    { label: "1 Year (+365d)", days: 365 },
  ];

  const isCurrentlyActive =
    salon.subscription_status === SUBSCRIPTION_STATUS.ACTIVE &&
    salon.subscription_expires_at &&
    new Date(salon.subscription_expires_at) > new Date();

  const currentBase = isCurrentlyActive
    ? new Date(salon.subscription_expires_at!)
    : new Date();

  const projectedDate = dayjs(currentBase).add(durationDays, "day").format("MMMM D, YYYY");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const payload: any = {
        subscription_plan: selectedPlan,
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
      };

      if (isCurrentlyActive) {
        payload.extend_subscription_days = durationDays;
      } else {
        payload.duration_days = durationDays;
      }

      await dispatch(
        updateSalonPlanAction({
          uuid: salon.uuid,
          payload,
        })
      ).unwrap();

      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to override subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Override Subscription Plan"
      description={`Grant or adjust subscription entitlement for "${salon.name}".`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border bg-background p-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground block">Current Plan:</span>
            <span className="font-bold text-foreground uppercase text-sm">
              {salon.subscription_plan}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-right">Current Status:</span>
            <span className="font-semibold uppercase text-emerald-600 dark:text-emerald-400 text-sm">
              {salon.subscription_status}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wide text-foreground mb-2.5">
            Select Entitlement Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {planTiers.map((tier) => {
              const isSelected = selectedPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedPlan(tier.id)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all relative ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary absolute top-3 right-3" />
                  )}
                  <p className="text-sm font-bold text-foreground">{tier.name}</p>
                  <p className="text-xs font-semibold text-primary mt-0.5">{tier.price}</p>
                  <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                    {tier.features}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wide text-foreground mb-2">
            Entitlement Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durationOptions.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setDurationDays(opt.days)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-xs font-semibold transition-all cursor-pointer ${
                  durationDays === opt.days
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                {isCurrentlyActive ? "Additive Subscription Extension" : "Immediate Activation Granted"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isCurrentlyActive ? (
                  <>
                    +<strong>{durationDays} days</strong> will stack onto existing plan until{" "}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{projectedDate}</span>
                  </>
                ) : (
                  <>
                    Status will become <span className="font-semibold text-foreground">active</span> until{" "}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{projectedDate}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="default" isLoading={isSubmitting}>
            Apply Plan & Activate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
