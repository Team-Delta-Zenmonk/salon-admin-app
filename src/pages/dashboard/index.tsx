import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  IndianRupee,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listSalonsAction, resetFilters, clearActionMessage, type SalonItem } from "@/features/salons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getDaysRemaining, formatDate } from "@/lib/utils";
import { getStorefrontUrl, getSubdomainDisplay } from "@/lib/domain";
import { ExtendTrialModal } from "@/pages/salons/_components/extend-trial-modal";
import { OverridePlanModal } from "@/pages/salons/_components/override-plan-modal";
import { ToggleStatusModal } from "@/pages/salons/_components/toggle-status-modal";
import { CreateSalonModal } from "@/pages/salons/_components/create-salon-modal";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "@/common/enums/subscription.enum";

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: salons, total, isLoading, error, actionMessage } = useAppSelector(
    (state) => state.salons
  );

  const [selectedSalon, setSelectedSalon] = useState<SalonItem | null>(null);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(listSalonsAction({ page: 1, limit: 100 }));
    dispatch(resetFilters());
    dispatch(listSalonsAction({ page: 1, limit: 100, search: undefined, status: undefined, is_active: undefined }));
  }, [dispatch]);

  const totalSalons = total || salons.length;
  const activePaid = salons.filter(
    (s) => s.subscription_status === SUBSCRIPTION_STATUS.ACTIVE && s.subscription_plan !== SUBSCRIPTION_PLAN.TRIAL
  ).length;
  const activeTrials = salons.filter((s) => s.subscription_status === SUBSCRIPTION_STATUS.TRIAL).length;
  const expiredSalons = salons.filter((s) => s.subscription_status === SUBSCRIPTION_STATUS.EXPIRED).length;
  const suspendedSalons = salons.filter((s) => !s.is_active || s.subscription_status === SUBSCRIPTION_STATUS.SUSPENDED).length;

  const estimatedMRR = salons.reduce((acc, s) => {
    if (s.subscription_status === SUBSCRIPTION_STATUS.ACTIVE) {
      if (s.subscription_plan === SUBSCRIPTION_PLAN.MONTHLY) return acc + 2499;
      if (s.subscription_plan === SUBSCRIPTION_PLAN.YEARLY) return acc + Math.round(24990 / 12);
    }
    return acc;
  }, 0);

  const stats = [
    {
      title: "Total Tenants",
      value: totalSalons,
      subtext: "All onboarded salons",
      icon: Building2,
      color: "text-primary",
      bg: "bg-card border-border",
    },
    {
      title: "Projected MRR",
      value: formatCurrency(estimatedMRR),
      subtext: `${activePaid} active subscriptions`,
      icon: IndianRupee,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-card border-border",
    },
    {
      title: "Active Trials",
      value: activeTrials,
      subtext: "7-15 day onboarding period",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-card border-border",
    },
    {
      title: "Expired / At Risk",
      value: expiredSalons,
      subtext: "Needs upgrade or follow-up",
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-card border-border",
    },
    {
      title: "Suspended / Locked",
      value: suspendedSalons,
      subtext: "Disabled tenant access",
      icon: ShieldAlert,
      color: "text-muted-foreground",
      bg: "bg-card border-border",
    },
  ];

  return (
    <div className="space-y-8">
      {actionMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between text-xs text-foreground shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{actionMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearActionMessage())}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Real-time multi-tenant monitoring, SaaS entitlement governance, and platform health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(listSalonsAction({ page: 1, limit: 100 }))}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Provision Salon
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`border ${stat.bg}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardDescription className="text-xs font-semibold text-muted-foreground">
                  {stat.title}
                </CardDescription>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                <p className="mt-1 text-[11px] text-muted-foreground font-medium">
                  {stat.subtext}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border p-5">
          <div>
            <CardTitle className="text-base sm:text-lg">Recent Tenants Snapshot</CardTitle>
            <CardDescription>
              Showing top salon tenants. Click any action to extend trials or override plans.
            </CardDescription>
          </div>
          <Link
            to="/salons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            View Full Salons Directory
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4 sm:px-6">Tenant Name & Domain</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Entitlement Plan</th>
                <th className="py-3 px-4">Status & Countdown</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 sm:px-6 text-right">Quick Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {isLoading && salons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Loading platform tenants...
                  </td>
                </tr>
              ) : error && salons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="text-destructive font-semibold mb-2">{error}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(listSalonsAction({ page: 1, limit: 100 }))}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : salons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No salons found. Click "Provision Salon" to onboard the first tenant.
                  </td>
                </tr>
              ) : (
                salons.slice(0, 10).map((salon) => {
                  const targetDate =
                    salon.subscription_status === "trial"
                      ? salon.trial_ends_at
                      : salon.subscription_expires_at;
                  const countdown = getDaysRemaining(targetDate);
                  const isSuspended = !salon.is_active || salon.subscription_status === "suspended";

                  return (
                    <tr
                      key={salon.uuid}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-foreground text-sm">
                          {salon.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] text-primary">
                            {getSubdomainDisplay(salon.slug)}
                          </span>
                          <a
                            href={getStorefrontUrl(salon.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                            title="Open Storefront"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-foreground">
                        <div>{salon.email}</div>
                        {salon.phone && (
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {salon.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          {salon.subscription_plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              isSuspended
                                ? "suspended"
                                : salon.subscription_status === "active"
                                ? "active"
                                : salon.subscription_status === "trial"
                                ? "trial"
                                : "expired"
                            }
                            withDot
                          >
                            {isSuspended ? "Suspended" : salon.subscription_status}
                          </Badge>
                          {!isSuspended && targetDate && (
                            <span
                              className={`text-[11px] font-mono ${
                                countdown.isExpired ? "text-destructive font-semibold" : "text-muted-foreground"
                              }`}
                            >
                              ({countdown.text})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {formatDate(salon.created_at)}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              setSelectedSalon(salon);
                              setTrialModalOpen(true);
                            }}
                          >
                            +Trial
                          </Button>

                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              setSelectedSalon(salon);
                              setPlanModalOpen(true);
                            }}
                          >
                            Plan
                          </Button>

                          <Button
                            variant={isSuspended ? "default" : "outline"}
                            size="xs"
                            onClick={() => {
                              setSelectedSalon(salon);
                              setStatusModalOpen(true);
                            }}
                          >
                            {isSuspended ? "Reactivate" : "Suspend"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ExtendTrialModal
        isOpen={trialModalOpen}
        onClose={() => {
          setTrialModalOpen(false);
          setSelectedSalon(null);
        }}
        salon={selectedSalon}
      />

      <OverridePlanModal
        isOpen={planModalOpen}
        onClose={() => {
          setPlanModalOpen(false);
          setSelectedSalon(null);
        }}
        salon={selectedSalon}
      />

      <ToggleStatusModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setSelectedSalon(null);
        }}
        salon={selectedSalon}
      />

      <CreateSalonModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
