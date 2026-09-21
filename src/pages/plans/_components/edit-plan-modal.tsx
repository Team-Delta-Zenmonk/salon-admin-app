import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSubscriptionPlan, clearPlansError, clearPlansSuccessMessage } from "@/features/plans/plans.slice";
import type { BackendPlan } from "@/features/salons/list-salons/list-salons.service";
import { AlertCircle, CheckCircle2, IndianRupee } from "lucide-react";

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: BackendPlan | null;
}

interface FormValues {
  amount: number;
  name: string;
  badge: string;
  description: string;
  billing_cycle: string;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, successMessage } = useAppSelector((state) => state.plans);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (plan) {
      reset({
        amount: plan.amount,
        name: plan.name,
        badge: plan.badge || "",
        description: plan.description || "",
        billing_cycle: plan.billing_cycle || "",
      });
    }
  }, [plan, reset]);

  const handleClose = () => {
    dispatch(clearPlansError());
    dispatch(clearPlansSuccessMessage());
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    if (!plan) return;
    const res = await dispatch(
      updateSubscriptionPlan({
        code: plan.id,
        payload: {
          amount: Number(data.amount),
          name: data.name,
          badge: data.badge,
          description: data.description,
          billing_cycle: data.billing_cycle,
        },
      })
    );

    if (updateSubscriptionPlan.fulfilled.match(res)) {
      setTimeout(() => {
        handleClose();
      }, 1200);
    }
  };

  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Change Pricing: ${plan.name}`}
      description="Update pricing and details for new tenant subscriptions."
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
            Plan Name
          </label>
          <Input
            {...register("name", { required: "Plan name is required" })}
            placeholder="e.g. Monthly Plan"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
            <span>Price / Amount (INR)</span>
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
                min: { value: 0, message: "Price must be non-negative" },
              })}
              placeholder="e.g. 2499"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            This price will immediately apply for all new tenants joining or upgrading to this plan.
          </p>
          {errors.amount && (
            <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Billing Cycle Tag
          </label>
          <Input
            {...register("billing_cycle")}
            placeholder="e.g. / mo, / yr, trial"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Badge Label
          </label>
          <Input
            {...register("badge")}
            placeholder="e.g. With Trial, Save 20%"
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
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Plan Pricing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
