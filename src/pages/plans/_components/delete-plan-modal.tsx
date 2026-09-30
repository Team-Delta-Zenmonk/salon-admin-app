import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteSubscriptionPlan, clearPlansError, clearPlansSuccessMessage } from "@/features/plans/plans.slice";
import type { BackendPlan } from "@/features/salons/list-salons/list-salons.service";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { showSnackbar } from "@/components/ui/snackbar";

interface DeletePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: BackendPlan | null;
}

export const DeletePlanModal: React.FC<DeletePlanModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, successMessage } = useAppSelector((state) => state.plans);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = isLoading || isSubmitting;

  const handleClose = (force = false) => {
    if (isBusy && !force) return;
    dispatch(clearPlansError());
    dispatch(clearPlansSuccessMessage());
    onClose();
  };

  const handleDelete = async () => {
    if (!plan || isBusy) return;
    try {
      setIsSubmitting(true);
      const planCode = plan.code || (plan.id as string);
      const res = await dispatch(deleteSubscriptionPlan(planCode));

      if (deleteSubscriptionPlan.fulfilled.match(res)) {
        setIsSubmitting(false);
        handleClose(true);
        showSnackbar("Plan deleted successfully");
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
      title={`Delete Plan: ${plan.name}`}
      description="Permanently remove this subscription plan from the database."
      maxWidth="md"
    >
      <div className="space-y-4">
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

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-foreground">
              Are you sure you want to permanently delete plan "{plan.name}" ({plan.code || plan.id})?
            </p>
            <p className="text-muted-foreground">
              This is a <strong>hard delete</strong> operation. The plan record will be completely purged from the database table.
            </p>
          </div>
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isBusy}
            isLoading={isBusy}
          >
            {isBusy ? "Deleting..." : "Permanently Delete Plan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
