import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearPlansError, clearPlansSuccessMessage } from "@/features/plans/plans.slice";
import { createSubscriptionPlan } from "@/features/plans/plans.action";
import { AlertCircle, CheckCircle2, IndianRupee } from "lucide-react";
import { createPlanSchema, type CreatePlanForm } from "./schema/create-plan.schema";
import { showSnackbar } from "@/components/ui/snackbar";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, successMessage } = useAppSelector((state) => state.plans);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = isLoading || isSubmitting;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePlanForm>({
    resolver: zodResolver(createPlanSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      amount: 2499,
      duration_days: 30,
      billing_cycle: "",
      description: "",
    },
  });

  const nameValue = watch("name");

  // Auto-generate code slug as user types name
  useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s_-]/g, "")
        .replace(/[\s_-]+/g, "_");
      setValue("code", slug, { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  const handleClose = (force = false) => {
    if (isBusy && !force) return;
    dispatch(clearPlansError());
    dispatch(clearPlansSuccessMessage());
    reset();
    onClose();
  };

  const onSubmit = async (data: CreatePlanForm) => {
    if (isBusy) return;
    try {
      setIsSubmitting(true);
      const res = await dispatch(
        createSubscriptionPlan({
          name: data.name,
          code: data.code,
          amount: Number(data.amount),
          duration_days: Number(data.duration_days),
          billing_cycle: data.billing_cycle || undefined,
          description: data.description || undefined,
        })
      );

      if (createSubscriptionPlan.fulfilled.match(res)) {
        setIsSubmitting(false);
        handleClose(true);
        showSnackbar("Plan created successfully");
      } else {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleClose()}
      preventClose={isBusy}
      title="Create New Subscription Plan"
      description="Add a custom subscription plan to your database table."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Plan Name *
          </label>
          <Input
            {...register("name", { required: "Plan name is required" })}
            placeholder="e.g. Quarterly Pro"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Code / Unique Identifier (Auto-generated) *
          </label>
          <Input
            {...register("code", { required: "Plan code is required" })}
            placeholder="e.g. quarterly_pro"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Unique slug identifier used in backend DB and Stripe billing metadata.
          </p>
          {errors.code && (
            <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Price / Amount (INR) *
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-[50%] z-1 h-4 w-4 text-muted-foreground translate-y-[-50%]" />
            <Input
              type="number"
              step="1"
              min="0"
              className="pl-9"
              {...register("amount", {
                required: "Price amount is required",
                min: { value: 0, message: "Price must be non-negative (0 or greater)" },
              })}
              placeholder="e.g. 0 or 2499"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Duration (Days) *
          </label>
          <Input
            type="number"
            min="1"
            {...register("duration_days", {
              required: "Duration days is required",
              min: { value: 1, message: "Duration must be at least 1 day" },
            })}
            placeholder="e.g. 14, 30, 90, 365"
          />
          {errors.duration_days && (
            <p className="mt-1 text-xs text-destructive">{errors.duration_days.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Billing Cycle Label (Optional)
          </label>
          <Input
            {...register("billing_cycle")}
            placeholder="e.g. / quarter, / 6 months"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Enter plan description..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose()}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isBusy} isLoading={isBusy}>
            {isBusy ? "Creating..." : "Create Plan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
