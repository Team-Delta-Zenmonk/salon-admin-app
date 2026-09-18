import React, { useEffect, useState } from "react";
import {
  Search,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  CheckCircle2,
  Calendar,
  Zap,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  listSalonsAction,
  setFilters,
  clearActionMessage,
  type SalonItem,
} from "@/features/salons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { getStorefrontUrl, getSubdomainDisplay } from "@/lib/domain";
import { ExtendTrialModal } from "./_components/extend-trial-modal";
import { OverridePlanModal } from "./_components/override-plan-modal";
import { ToggleStatusModal } from "./_components/toggle-status-modal";
import { CreateSalonModal } from "./_components/create-salon-modal";

export const SalonsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data: salons,
    total,
    page,
    totalPages,
    filters,
    isLoading,
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
    const timer = setTimeout(() => {
      dispatch(setFilters({ search: searchInput || undefined, page: 1 }));
      dispatch(listSalonsAction({ search: searchInput || undefined, page: 1 }));
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

  const handlePageChange = (newPage: number) => {
    dispatch(setFilters({ page: newPage }));
    dispatch(listSalonsAction({ page: newPage }));
  };

  const statusTabs = [
    { id: "all", label: "All Tenants" },
    { id: "trial", label: "Active Trials" },
    { id: "active", label: "Subscribed" },
    { id: "expired", label: "Expired" },
    { id: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-6">
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
            Master Salons Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage tenant workspaces, override subscription plans, extend trials, and enforce access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(listSalonsAction())}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Provision Tenant
          </Button>
        </div>
      </div>

      <Card className="border-border p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80">
            <Input
              placeholder="Search by name, email, or slug..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </Card>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Tenant & Subdomain</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Entitlement Tier</th>
                <th className="py-3.5 px-4">Subscription Status</th>
                <th className="py-3.5 px-4">Countdown / Expiry</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {isLoading && salons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Fetching salon tenants...
                  </td>
                </tr>
              ) : error && salons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="text-destructive font-semibold mb-2">{error}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(listSalonsAction())}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : salons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    No salon tenants match the current query.
                  </td>
                </tr>
              ) : (
                salons.map((salon) => {
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
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-foreground text-sm">
                          {salon.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] text-primary font-medium">
                            {getSubdomainDisplay(salon.slug)}
                          </span>
                          <a
                            href={getStorefrontUrl(salon.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                            title="Visit Public Storefront"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-foreground font-medium">{salon.email}</div>
                        {salon.phone && (
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {salon.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="capitalize font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          {salon.subscription_plan}
                        </span>
                      </td>

                      <td className="py-4 px-4">
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
                      </td>

                      <td className="py-4 px-4">
                        {isSuspended ? (
                          <span className="text-muted-foreground font-mono">Access Locked</span>
                        ) : targetDate ? (
                          <div>
                            <span
                              className={`font-semibold font-mono ${
                                countdown.isExpired ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {countdown.text}
                            </span>
                            <div className="text-[10px] text-muted-foreground">
                              {formatDate(targetDate)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-muted-foreground text-[11px]">
                        {formatDate(salon.created_at)}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="xs"
                            title="Extend Trial"
                            onClick={() => {
                              setSelectedSalon(salon);
                              setTrialModalOpen(true);
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400" />
                            +Trial
                          </Button>

                          <Button
                            variant="secondary"
                            size="xs"
                            title="Override Entitlement Plan"
                            onClick={() => {
                              setSelectedSalon(salon);
                              setPlanModalOpen(true);
                            }}
                          >
                            <Zap className="h-3 w-3 mr-1 text-primary" />
                            Plan
                          </Button>

                          <Button
                            variant={isSuspended ? "default" : "outline"}
                            size="xs"
                            title={isSuspended ? "Reactivate Salon" : "Suspend Salon"}
                            onClick={() => {
                              setSelectedSalon(salon);
                              setStatusModalOpen(true);
                            }}
                          >
                            {isSuspended ? (
                              <>
                                <ShieldCheck className="h-3 w-3 mr-1 text-primary-foreground" />
                                Reactivate
                              </>
                            ) : (
                              <>
                                <ShieldBan className="h-3 w-3 mr-1 text-destructive" />
                                Suspend
                              </>
                            )}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 sm:px-6 py-3.5 text-xs text-muted-foreground">
            <div>
              Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span> (
              {total} total records)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => handlePageChange(page - 1)}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => handlePageChange(page + 1)}
                className="h-8 px-2"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
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
