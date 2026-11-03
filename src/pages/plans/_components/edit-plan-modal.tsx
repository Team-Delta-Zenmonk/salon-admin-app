import React, { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearPlansError, clearPlansSuccessMessage } from "@/features/plans/plans.slice";
import { updateSubscriptionPlan } from "@/features/plans/plans.action";
import type { BackendPlan } from "@/features/salons/list-salons/list-salons.service";
import { AlertCircle, IndianRupee } from "lucide-react";
import { getEditPlanSchema, type EditPlanForm } from "./schema/edit-plan.schema";
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
  const planCode = plan?.code || (plan?.id !== undefined ? String(plan.id) : "");

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditPlanForm>({
    resolver: zodResolver(getEditPlanSchema(planCode)) as unknown as Resolver<EditPlanForm>,
    mode: "onChange",
  });

  const descriptionValue = watch("description") || "";

  useEffect(() => {
    if (isOpen) {
      dispatch(clearPlansError());
      dispatch(clearPlansSuccessMessage());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && plan) {
      reset({
        amount: plan.amount,
        name: plan.name,
        code: plan.code || String(plan.id),
        description: plan.description || "",
        billing_cycle: plan.billing_cycle || "",
        duration_days: plan.duration_days || 30,
      });
      clearErrors();
    }
  }, [isOpen, plan, reset, clearErrors]);

  const handleClose = (force = false) => {
    if (isBusy && !force) return;
    dispatch(clearPlansError());
    dispatch(clearPlansSuccessMessage());
    clearErrors();
    onClose();
  };

  const onSubmit = async (data: EditPlanForm) => {
    if (!plan || isBusy) return;
    try {
      setIsSubmitting(true);
      const res = await dispatch(
        updateSubscriptionPlan({
          uuid: plan.uuid,
          payload: {
            amount: Number(data.amount),
            name: data.name,
            code: data.code || plan.code || String(plan.id),
            description: data.description ? data.description.trim() : null,
            billing_cycle: data.billing_cycle || undefined,
            duration_days: Number(data.duration_days),
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
      title={`Change Pricing:`}
      description="Update pricing and details for new tenant subscriptions."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Plan Name</label>
          <Input {...register("name")} maxLength={255} placeholder="e.g. Monthly Plan" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
            <span>Price / Amount (INR)</span>
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-[50%] z-1 h-4 w-4 text-muted-foreground translate-y-[-50%]" />
            <Input type="number" step="1" max={100000} className="pl-9" {...register("amount")} placeholder="e.g. 2499" />
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
          <label className="block text-xs font-semibold text-foreground mb-1">
            Duration (Days)
          </label>
          <Input
            type="number"
            min={1}
            max={365}
            {...register("duration_days")}
            placeholder="e.g. 14, 30, 90, 365"
          />
          {errors.duration_days && (
            <p className="mt-1 text-xs text-destructive">{errors.duration_days.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Billing Cycle Tag (Optional)</label>
          <Input {...register("billing_cycle")} maxLength={50} placeholder="e.g. / mo, / yr, trial" />
          {errors.billing_cycle && <p className="mt-1 text-xs text-destructive">{errors.billing_cycle.message}</p>}
        </div>


        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-foreground">Description (Optional)</label>
            <span
              className={`text-[11px] ${
                descriptionValue.length > 300
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {descriptionValue.length} / 300
            </span>
          </div>
          <textarea
            {...register("description")}
            maxLength={300}
            rows={3}
            style={{ scrollbarWidth: "none" }}
            className={`no-scrollbar block w-full resize-none rounded-lg border bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            }`}
            placeholder="Enter plan description (max 300 characters)..."
          />
          {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => handleClose()} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" disabled={isBusy || !isDirty} isLoading={isBusy}>
            {isBusy ? "Saving..." : "Save Plan Pricing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
