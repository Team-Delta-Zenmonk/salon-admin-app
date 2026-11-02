import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, AlertCircle, PlusCircle, ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SalonItem } from "@/features/salons/list-salons/list-salons.service";
import { useAppDispatch } from "@/store/hooks";
import { extendSalonDurationAction } from "@/features/salons/extend-salon-duration/extend-salon-duration.action";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "@/common/enums/subscription.enum";
import { showSnackbar } from "@/components/ui/snackbar";
import { cn, formatDate } from "@/lib/utils";

const durationSchema = z.object({
  durationDays: z.coerce.number().min(1, "Minimum 1 day").max(1825, "Maximum 1825 days (5 years)"),
});

type DurationForm = z.infer<typeof durationSchema>;

interface UpdateDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: SalonItem | null;
  onSuccess?: () => void;
}

export const UpdateDurationModal: React.FC<UpdateDurationModalProps> = ({
  isOpen,
  onClose,
  salon,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DurationForm>({
    resolver: zodResolver(durationSchema),
    defaultValues: { durationDays: 30 },
  });

  const durationDaysValue = watch("durationDays");

  useEffect(() => {
    if (isOpen && salon) {
      reset({ durationDays: 30 });
      setError(null);
    }
  }, [isOpen, salon?.uuid, reset]);

  const isPaidPlan = salon?.subscription_plan && salon.subscription_plan !== SUBSCRIPTION_PLAN.TRIAL;

  const isCurrentlyActivePlan =
    Boolean(isPaidPlan &&
    salon?.subscription_status === SUBSCRIPTION_STATUS.ACTIVE &&
    salon?.subscription_expires_at &&
    new Date(salon.subscription_expires_at) > new Date());

  const isTrialActive =
    Boolean(!isPaidPlan &&
    salon?.trial_ends_at &&
    new Date(salon.trial_ends_at) > new Date());

  const currentBaseDate = isPaidPlan
    ? (isCurrentlyActivePlan ? new Date(salon!.subscription_expires_at!) : new Date())
    : (isTrialActive ? new Date(salon!.trial_ends_at!) : new Date());

  const projectedDate =
    Number(durationDaysValue) > 0
      ? dayjs(currentBaseDate).add(Number(durationDaysValue), "day").toDate()
      : null;

  const onSubmit = async (data: DurationForm) => {
    if (!salon) return;
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const payload: any = isPaidPlan
        ? {
            subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
            ...(isCurrentlyActivePlan
              ? { extend_subscription_days: data.durationDays }
              : { duration_days: data.durationDays }),
          }
        : {
            subscription_status: SUBSCRIPTION_STATUS.TRIAL,
            ...(isTrialActive
              ? { extend_subscription_days: data.durationDays }
              : { duration_days: data.durationDays }),
          };
      await dispatch(extendSalonDurationAction({ uuid: salon.uuid, payload })).unwrap();
      showSnackbar(`${isPaidPlan ? "Subscription" : "Trial"} duration updated successfully`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to update duration");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!salon) return null;

  const durationOptions = [
    { label: "+30 Days", days: 30 },
    { label: "+90 Days", days: 90 },
    { label: "+180 Days", days: 180 },
    { label: "+365 Days", days: 365 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={isSubmitting}
      title={isPaidPlan ? "Add Plan Duration" : "Add Trial Duration"}
      description={`Add extra duration for "${salon.name}"`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Current Status / Plan:</span>
            <span className="font-semibold text-foreground capitalize">
              {salon.subscription_plan || "None"} ({salon.subscription_status})
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>
              {isPaidPlan
                ? (isCurrentlyActivePlan ? "Current Plan Expiry:" : "Starting From:")
                : (isTrialActive ? "Current Trial Expiry:" : "Starting From:")}
            </span>
            <span className="font-mono font-medium text-foreground">
              {isPaidPlan
                ? (isCurrentlyActivePlan ? formatDate(salon.subscription_expires_at) : "Today (Immediate activation)")
                : (isTrialActive ? formatDate(salon.trial_ends_at) : "Today (Immediate trial)")}
            </span>
          </div>
          {projectedDate && (
            <div className="pt-2 border-t border-border flex items-center justify-between text-primary font-medium">
              <span className="flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" />
                New Expiry Date (+{durationDaysValue || 0}d):
              </span>
              <span className="font-mono font-bold text-foreground">
                {formatDate(projectedDate)}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Quick Add Presets:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {durationOptions.map((opt) => {
              const isSelected = Number(durationDaysValue) === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setValue("durationDays", opt.days, { shouldValidate: true })}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-xs font-semibold transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Input
            label="Duration to Add (Days)"
            type="number"
            min={1}
            max={1825}
            step="1"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            placeholder="Enter days to add (e.g. 30)"
            error={errors.durationDays?.message}
            {...register("durationDays")}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="default" isLoading={isSubmitting} disabled={isSubmitting} className="w-full sm:w-auto">
            Add Duration
          </Button>
        </div>
      </form>
    </Modal>
  );
};
