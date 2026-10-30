import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionPlans, toggleSubscriptionPlanStatus } from "@/features/plans/plans.action";
import type { BackendPlan } from "@/features/salons/list-salons/list-salons.service";
import { EditPlanModal } from "./_components/edit-plan-modal";
import { CreatePlanModal } from "./_components/create-plan-modal";
import { DeletePlanModal } from "./_components/delete-plan-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Edit,
  RefreshCw,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Plus,
  Trash2,
} from "lucide-react";
import { EllipsisCell } from "@/components/ui/ellipsis-cell";
import { showSnackbar } from "@/components/ui/snackbar";

export const PlansPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans, isLoading, togglingPlanUuid, error } = useAppSelector((state) => state.plans);
  const [selectedPlan, setSelectedPlan] = useState<BackendPlan | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const handleEditPlan = (plan: BackendPlan) => {
    if (plan.is_active === false) {
      showSnackbar("Cannot edit a deactivated plan. Please activate it first.", "error");
      return;
    }
    setSelectedPlan(plan);
    setEditModalOpen(true);
  };

  const handleDeletePlan = (plan: BackendPlan) => {
    if (plan.is_active === false) {
      showSnackbar("Cannot delete a deactivated plan. Please activate it first.", "error");
      return;
    }
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  const handleToggleStatus = async (plan: BackendPlan) => {
    try {
      const res = await dispatch(toggleSubscriptionPlanStatus(plan.uuid)).unwrap();
      showSnackbar(res.message || `Plan is now ${res.is_active ? "active" : "inactive"}`);
    } catch (err: unknown) {
      const errorMsg = typeof err === "string" ? err : "Failed to toggle plan status";
      showSnackbar(errorMsg, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-primary" />
            Subscription Plans & Pricing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tenant subscription plan pricing stored in database table. Changes will dynamically apply to new tenant registrations and subscription upgrades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Create Plan</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading && plans.length === 0 ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading plan details from database...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isToggling = togglingPlanUuid === plan.uuid;
            const isActive = plan.is_active !== false;

            return (
              <Card
                key={plan.uuid || plan.id}
                className={`relative flex flex-col justify-between overflow-hidden border-border transition-all hover:border-primary/40 hover:shadow-md ${
                  !isActive ? "opacity-75 bg-muted/20" : ""
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl font-bold text-foreground">
                      <EllipsisCell as="span" value={plan.name} />
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground break-words leading-relaxed mt-1">
                    <EllipsisCell as="span" value={plan.description} />
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground shrink-0">
                      {plan.formatted_price}
                    </span>
                    {plan.billing_cycle && (
                      <span className="text-sm text-muted-foreground font-medium break-words">
                        {plan.billing_cycle}
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Numeric Amount (INR):</span>
                      <span className="font-bold text-foreground font-mono flex items-center">
                        <IndianRupee className="h-3 w-3 mr-0.5" />
                        {plan.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Currency:</span>
                      <span className="font-bold text-foreground font-mono">{plan.currency}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Plan Duration:</span>
                      <Badge variant="outline" className="font-bold text-foreground font-mono inline-flex items-center justify-center leading-none">
                        {plan.duration_days ?? 30} days
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/50">
                      <span className="font-medium">Plan Status:</span>
                      <Button
                        type="button"
                        size="sm"
                        variant={isActive ? "outline" : "default"}
                        disabled={isToggling}
                        isLoading={isToggling}
                        onClick={() => handleToggleStatus(plan)}
                        className={`h-7 px-3 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs ${
                          isActive
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {!isToggling && (
                          isActive ? (
                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                          )
                        )}
                        <span>{isActive ? "Deactivate" : "Activate"}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <Button
                      variant="default"
                      className="flex-1 font-semibold shadow-xs gap-1.5"
                      disabled={!isActive}
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4 shrink-0" />
                      <span>Edit Pricing</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60 font-semibold gap-1.5 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                      disabled={!isActive}
                      onClick={() => handleDeletePlan(plan)}
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EditPlanModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        plan={selectedPlan}
      />

      <CreatePlanModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <DeletePlanModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
};
