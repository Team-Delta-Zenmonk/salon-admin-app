import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Zap, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { SalonItem } from "@/features/salons/list-salons/list-salons.service";
import { useAppDispatch } from "@/store/hooks";
import { updateSalonPlanAction } from "@/features/salons/update-salon-plan/update-salon-plan.action";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS, type SubscriptionPlan } from "@/common/enums/subscription.enum";

const overridePlanSchema = z.object({
  selectedPlan: z.enum([SUBSCRIPTION_PLAN.MONTHLY, SUBSCRIPTION_PLAN.YEARLY] as const),
  durationDays: z.coerce.number().min(1, "Minimum 1 day"),
});

type OverridePlanForm = z.infer<typeof overridePlanSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultPlan = salon?.subscription_plan === SUBSCRIPTION_PLAN.YEARLY 
    ? SUBSCRIPTION_PLAN.YEARLY 
    : SUBSCRIPTION_PLAN.MONTHLY;

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OverridePlanForm>({
    resolver: zodResolver(overridePlanSchema),
    defaultValues: {
      selectedPlan: defaultPlan,
      durationDays: 30,
    },
  });

  const watchSelectedPlan = watch("selectedPlan");
  const watchDurationDays = watch("durationDays");

  useEffect(() => {
    if (isOpen && salon) {
      reset({
        selectedPlan: salon.subscription_plan === SUBSCRIPTION_PLAN.YEARLY 
          ? SUBSCRIPTION_PLAN.YEARLY 
          : SUBSCRIPTION_PLAN.MONTHLY,
        durationDays: 30,
      });
      setError(null);
    }
  }, [isOpen, reset, salon]);

  if (!salon) return null;

  const planTiers: {
    id: typeof SUBSCRIPTION_PLAN.MONTHLY | typeof SUBSCRIPTION_PLAN.YEARLY;
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

  const projectedDate = dayjs(currentBase).add(watchDurationDays, "day").format("MMMM D, YYYY");

  const onSubmit = async (data: OverridePlanForm) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload: {
        subscription_plan: SubscriptionPlan;
        subscription_status: typeof SUBSCRIPTION_STATUS.ACTIVE;
        extend_subscription_days?: number;
        duration_days?: number;
      } = {
        subscription_plan: data.selectedPlan,
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
      };

      if (isCurrentlyActive) {
        payload.extend_subscription_days = data.durationDays;
      } else {
        payload.duration_days = data.durationDays;
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              const isSelected = watchSelectedPlan === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setValue("selectedPlan", tier.id, { shouldValidate: true })}
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
          {errors.selectedPlan?.message && (
            <p className="mt-1 text-xs text-destructive">{errors.selectedPlan.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wide text-foreground mb-2">
            Entitlement Duration
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {durationOptions.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setValue("durationDays", opt.days, { shouldValidate: true })}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-xs font-semibold transition-all cursor-pointer ${
                  watchDurationDays === opt.days
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
          {errors.durationDays?.message && (
            <p className="mt-1 text-xs text-destructive">{errors.durationDays.message}</p>
          )}
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
                    +<strong>{watchDurationDays} days</strong> will stack onto existing plan until{" "}
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

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={isSubmitting}
            className="w-full sm:w-auto"
          >
            Apply Plan & Activate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
