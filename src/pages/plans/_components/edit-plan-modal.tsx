import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSubscriptionPlan, clearPlansError, clearPlansSuccessMessage } from "@/features/plans/plans.slice";
import type { BackendPlan } from "@/features/salons/list-salons/list-salons.service";
import { AlertCircle, IndianRupee } from "lucide-react";
import { editPlanSchema, type EditPlanForm } from "./schema/edit-plan.schema";
import { showSnackbar } from "@/components/ui/snackbar";

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: BackendPlan | null;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ isOpen, onClose, plan }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.plans);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = isLoading || isSubmitting;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPlanForm>({
    resolver: zodResolver(editPlanSchema),
  });

  useEffect(() => {
    if (plan) {
      reset({
        amount: plan.amount,
        name: plan.name,        description: plan.description || "",
        billing_cycle: plan.billing_cycle || "",
      });
    }
  }, [plan, reset]);

  const handleClose = (force = false) => {
    if (isBusy && !force) return;
    dispatch(clearPlansError());
    dispatch(clearPlansSuccessMessage());
    onClose();
  };

  const onSubmit = async (data: EditPlanForm) => {
    if (!plan || isBusy) return;
    try {
      setIsSubmitting(true);
      const res = await dispatch(
        updateSubscriptionPlan({
          code: plan.id,
          payload: {
            amount: Number(data.amount),
            name: data.name,
            description: data.description,
            billing_cycle: data.billing_cycle,
          },
        }),
      );

      if (updateSubscriptionPlan.fulfilled.match(res)) {
        setIsSubmitting(false);
        handleClose(true);
        showSnackbar("Plan updated successfully");
      } else {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleClose()}
      preventClose={isBusy}
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

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Plan Name</label>
          <Input {...register("name")} placeholder="e.g. Monthly Plan" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
            <span>Price / Amount (INR)</span>
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-[50%] z-1 h-4 w-4 text-muted-foreground translate-y-[-50%]" />
            <Input type="number" step="1" min="0" className="pl-9" {...register("amount")} placeholder="e.g. 2499" />
          </div>
          {errors.amount ? (
            <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              This price will immediately apply for all new tenants joining or upgrading to this plan.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Billing Cycle Tag</label>
          <Input {...register("billing_cycle")} placeholder="e.g. / mo, / yr, trial" />
          {errors.billing_cycle && <p className="mt-1 text-xs text-destructive">{errors.billing_cycle.message}</p>}
        </div>


        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Enter plan description..."
          />
          {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => handleClose()} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" disabled={isBusy} isLoading={isBusy}>
            {isBusy ? "Saving..." : "Save Plan Pricing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
