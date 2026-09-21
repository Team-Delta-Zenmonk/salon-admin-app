import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionPlans } from "@/features/plans/plans.slice";
import type { BackendPlan } from "@/features/salons/list-salons/list-salons.service";
import { EditPlanModal } from "./_components/edit-plan-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Edit, RefreshCw, CheckCircle2, IndianRupee } from "lucide-react";

export const PlansPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { plans, isLoading, error } = useAppSelector((state) => state.plans);
  const [selectedPlan, setSelectedPlan] = useState<BackendPlan | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const handleEditPlan = (plan: BackendPlan) => {
    setSelectedPlan(plan);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Subscription Plans & Pricing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tenant subscription plan pricing stored in database table. Changes will dynamically apply to new tenant registrations and subscription upgrades.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(fetchSubscriptionPlans())}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
          {plans.map((plan) => (
            <Card key={plan.id} className="relative flex flex-col justify-between overflow-hidden border-border transition-all hover:border-primary/40 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs uppercase">
                    {plan.id}
                  </Badge>
                  {plan.badge && (
                    <Badge variant="default" size="sm">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold mt-3 text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    {plan.formatted_price}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {plan.billing_cycle}
                  </span>
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
                    <span>Active Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Change Pricing
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditPlanModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
};
