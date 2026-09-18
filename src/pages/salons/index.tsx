import React, { useEffect, useState } from "react";
import {
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Filter,
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
import { Select } from "@/components/ui/select";
import { SalonsTable } from "./_components/salons-table";
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

  const statusOptions = [
    { value: "all", label: "All Tenants" },
    { value: "trial", label: "Active Trials" },
    { value: "active", label: "Subscribed" },
    { value: "expired", label: "Expired" },
    { value: "suspended", label: "Suspended" },
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
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Centrally manage multi-tenant salon organizations, provisioning, and subscription overrides.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(listSalonsAction())}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
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

      <Card className="border-border p-4 relative z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:flex-1 sm:max-w-md">
            <Input
              value={searchInput}
              placeholder="Search"
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
      </Card>

      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          <SalonsTable
            salons={salons}
            isLoading={isLoading}
            error={error}
            onRetry={() => dispatch(listSalonsAction())}
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
        </CardContent>

        {totalPages > 1 && (
          <div className="flex flex-col min-[700px]:flex-row items-center justify-between gap-3 border-t border-border px-4 sm:px-6 py-3.5 text-xs text-muted-foreground">
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
