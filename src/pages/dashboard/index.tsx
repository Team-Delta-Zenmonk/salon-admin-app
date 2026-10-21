import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Building2,
  IndianRupee,
  Clock,
  AlertTriangle,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  listSalonsAction,
  resetFilters,
  setFilters,
  clearActionMessage,
  type SalonItem,
} from "@/features/salons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { SalonsTable } from "@/pages/salons/_components/salons-table";
import { ExtendTrialModal } from "@/pages/salons/_components/extend-trial-modal";
import { OverridePlanModal } from "@/pages/salons/_components/override-plan-modal";
import { ToggleStatusModal } from "@/pages/salons/_components/toggle-status-modal";
import { CreateSalonModal } from "@/pages/salons/_components/create-salon-modal";
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS } from "@/common/enums/subscription.enum";
import { DashboardMetrics, type MetricStat } from "./_components/dashboard-metrics";

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data: salons,
    total,
    page,
    hasMore,
    filters,
    isLoading,
    isLoadingMore,
    error,
    actionMessage,
  } = useAppSelector((state) => state.salons);

  const [searchInput, setSearchInput] = useState(filters?.search || "");
  const [activeTab, setActiveTab] = useState<string>("all");

  const [selectedSalon, setSelectedSalon] = useState<SalonItem | null>(null);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(resetFilters());
    dispatch(listSalonsAction({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: searchInput.trim() || undefined, page: 1 }));
      dispatch(listSalonsAction({ search: searchInput.trim() || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, dispatch]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    let statusFilter: string | undefined = undefined;
    let activeFilter: boolean | undefined = undefined;

    if (tab === "trial") statusFilter = "trial";
    else if (tab === "active") statusFilter = "active";
    else if (tab === "expired") statusFilter = "expired";
    else if (tab === "suspended") {
      activeFilter = false;
      statusFilter = "suspended";
    }

    dispatch(setFilters({ status: statusFilter, is_active: activeFilter, page: 1 }));
    dispatch(listSalonsAction({ status: statusFilter, is_active: activeFilter, page: 1 }));
  };

  const handleRefresh = () => {
    dispatch(listSalonsAction({ page: 1 }));
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    dispatch(listSalonsAction({ page: page + 1 }));
  };

  const statusOptions = [
    { value: "all", label: "All Tenants" },
    { value: "trial", label: "Active Trials" },
    { value: "active", label: "Subscribed" },
    { value: "expired", label: "Expired" },
    { value: "suspended", label: "Suspended" },
  ];

  const totalSalons = total || salons.length;
  const activePaid = salons.filter(
    (s) => s.subscription_status === SUBSCRIPTION_STATUS.ACTIVE && s.subscription_plan !== SUBSCRIPTION_PLAN.TRIAL,
  ).length;
  const activeTrials = salons.filter((s) => s.subscription_status === SUBSCRIPTION_STATUS.TRIAL).length;
  const expiredSalons = salons.filter((s) => s.subscription_status === SUBSCRIPTION_STATUS.EXPIRED).length;
  const suspendedSalons = salons.filter(
    (s) => !s.is_active || s.subscription_status === SUBSCRIPTION_STATUS.SUSPENDED,
  ).length;

  const estimatedMRR = salons.reduce((acc, s) => {
    if (s.subscription_status === SUBSCRIPTION_STATUS.ACTIVE) {
      if (s.subscription_plan === SUBSCRIPTION_PLAN.MONTHLY) return acc + 2499;
      if (s.subscription_plan === SUBSCRIPTION_PLAN.YEARLY) return acc + Math.round(24990 / 12);
    }
    return acc;
  }, 0);

  const stats: MetricStat[] = [
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Operations Dashboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Real-time multi-tenant monitoring, SaaS entitlement governance, and platform health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
            <PlusCircle className="h-3.5 w-3.5" />
            Provision Salon
          </Button>
        </div>
      </div>

      <DashboardMetrics stats={stats} />

      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border p-5">
          <div>
            <CardTitle className="text-base sm:text-lg">Salon Owners & Tenants Directory</CardTitle>
            <CardDescription>
              Showing {salons.length} of {total} registered salon tenants. Scroll down to automatically load more.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="p-4 sm:px-6 border-b border-border bg-muted/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:flex-1 sm:max-w-md">
              <Input
                value={searchInput}
                placeholder="Search by name, email, or subdomain..."
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="w-full sm:w-56 shrink-0">
              <Select
                value={activeTab}
                onChange={(val) => handleTabChange(val)}
                options={statusOptions}
                leftIcon={<Filter className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <InfiniteScroll
            dataLength={salons.length}
            next={handleLoadMore}
            hasMore={hasMore}
            scrollableTarget="admin-main-content"
            scrollThreshold={0.8}
            loader={
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading more salon tenants...</span>
              </div>
            }
            endMessage={
              salons.length > 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <div className="w-12 h-px bg-border/50"></div>
                  <span>Showing all {salons.length} salon tenants</span>
                  <div className="w-12 h-px bg-border/50"></div>
                </div>
              ) : null
            }
          >
            <SalonsTable
              salons={salons}
              isLoading={isLoading}
              error={error}
              emptyMessage='No salons found. Click "Provision Salon" to onboard the first tenant.'
              onRetry={handleRefresh}
              onExtendTrial={(salon) => {
                setSelectedSalon(salon);
                setTrialModalOpen(true);
              }}
              onOverridePlan={(salon) => {
                setSelectedSalon(salon);
                setPlanModalOpen(true);
              }}
              onToggleStatus={(salon) => {
                setSelectedSalon(salon);
                setStatusModalOpen(true);
              }}
            />
          </InfiniteScroll>
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

      <CreateSalonModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
};
