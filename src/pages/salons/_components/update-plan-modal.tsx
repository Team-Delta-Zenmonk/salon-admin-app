import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { Zap, Calendar, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { SalonItem } from "@/features/salons/list-salons/list-salons.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSalonPlanAction } from "@/features/salons/update-salon-plan/update-salon-plan.action";
import { fetchSubscriptionPlans } from "@/features/plans/plans.action";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "@/common/enums/subscription.enum";
import { showSnackbar } from "@/components/ui/snackbar";
import { EllipsisCell } from "@/components/ui/ellipsis-cell";

const planSchema = z.object({
  selectedPlan: z.string().min(1, "Please select a plan"),
});

type PlanForm = z.infer<typeof planSchema>;

interface UpdatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: SalonItem | null;
}

export const UpdatePlanModal: React.FC<UpdatePlanModalProps> = ({ isOpen, onClose, salon }) => {
  const dispatch = useAppDispatch();
  const { plans: allBackendPlans, page, hasMore, isLoading: isLoadingPlans, isInitialLoading } = useAppSelector(
    (state) => state.plans
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: { selectedPlan: "" },
  });

  const backendPlans = allBackendPlans.filter(
    (p) => p.id !== SUBSCRIPTION_PLAN.TRIAL && p.code !== SUBSCRIPTION_PLAN.TRIAL,
  );

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSubscriptionPlans({ page: 1, limit: 10 }));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && salon) {
      const defaultPlan =
        salon.subscription_plan && salon.subscription_plan !== SUBSCRIPTION_PLAN.TRIAL
          ? salon.subscription_plan
          : backendPlans[0]?.uuid || "";
      reset({ selectedPlan: defaultPlan });
      setError(null);
    }
  }, [isOpen, salon?.uuid, salon?.subscription_plan, backendPlans.length, reset]);

  const loadMorePlans = useCallback(() => {
    if (isLoadingPlans || !hasMore) return;
    dispatch(fetchSubscriptionPlans({ page: page + 1, limit: 10 }));
  }, [dispatch, page, hasMore, isLoadingPlans]);

  const onSubmit = async (data: PlanForm) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const payload = {
        subscription_plan: data.selectedPlan,
        subscription_status: SUBSCRIPTION_STATUS.ACTIVE,
      };
      await dispatch(updateSalonPlanAction({ uuid: salon!.uuid, payload })).unwrap();
      showSnackbar("Subscription plan updated successfully");
      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to update subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!salon) return null;

  const planTiers = backendPlans.map((p) => ({
    id: p.uuid || p.code || String(p.id),
    name: p.name,
    price: `${p.formatted_price} ${p.billing_cycle}`,
    features: p.description,
  }));

  const selectedPlan = watch("selectedPlan");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={isSubmitting}
      title="Update Subscription Plan"
      description={`Change plan for "${salon.name}"`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {planTiers.length === 0 && isInitialLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Loading plans...</span>
          </div>
        ) : planTiers.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No plans available to select.
          </div>
        ) : (
          <div id="update-plan-modal-scrollable" className="max-h-[380px] overflow-y-auto pr-1">
            <InfiniteScroll
              dataLength={planTiers.length}
              next={loadMorePlans}
              hasMore={hasMore}
              scrollableTarget="update-plan-modal-scrollable"
              loader={
                <div className="py-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading more plans...</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                {planTiers.map((tier) => {
                  const isSelected = tier.id === (selectedPlan ?? "");
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
                      <EllipsisCell value={tier.name} className="text-sm font-bold text-foreground" />
                      <p className="text-xs font-semibold text-primary mt-0.5">{tier.price}</p>
                      <EllipsisCell
                        value={tier.features}
                        className="text-[11px] text-muted-foreground mt-2 line-clamp-2"
                        maxLines={2}
                      />
                    </div>
                  );
                })}
              </div>
            </InfiniteScroll>
          </div>
        )}

        {errors.selectedPlan?.message && (
          <p className="mt-1 text-xs text-destructive">{errors.selectedPlan.message}</p>
        )}
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
            Update Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
