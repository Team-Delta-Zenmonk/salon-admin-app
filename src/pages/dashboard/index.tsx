import React, { useEffect, useState, useRef } from "react";
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  listSalonsAction,
  clearActionMessage,
  DEFAULT_PAGE_LIMIT,
  type SalonItem,
} from "@/features/salons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { sanitizeSearchQuery } from "@/lib/utils";
import { SalonsTable } from "@/pages/salons/_components/salons-table";
import { ExtendTrialModal } from "@/pages/salons/_components/extend-trial-modal";
import { OverridePlanModal } from "@/pages/salons/_components/override-plan-modal";
import { ToggleStatusModal } from "@/pages/salons/_components/toggle-status-modal";
import { CreateSalonModal } from "@/pages/salons/_components/create-salon-modal";

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data: salons,
    total,
    totalTenants,
    page,
    limit,
    totalPages,
    hasMore,
    isLoading,
    error,
    actionMessage,
  } = useAppSelector((state) => state.salons);

  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const [selectedSalon, setSelectedSalon] = useState<SalonItem | null>(null);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const hasUserTypedRef = useRef(false);

  const getFilterParams = (tab: string, search: string) => {
    let statusFilter: string | undefined = undefined;
    let activeFilter: boolean | undefined = undefined;

    if (tab === "trial") statusFilter = "trial";
    else if (tab === "active") statusFilter = "active";
    else if (tab === "expired") statusFilter = "expired";
    else if (tab === "suspended") {
      activeFilter = false;
      statusFilter = "suspended";
    }

    return {
      status: statusFilter,
      is_active: activeFilter,
      search: search.trim() || undefined,
    };
  };

  useEffect(() => {
    dispatch(listSalonsAction({ page: 1, limit: DEFAULT_PAGE_LIMIT, isAppend: false }));
  }, [dispatch]);

  useEffect(() => {
    if (!hasUserTypedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      const activeFilters = getFilterParams(activeTab, searchInput);
      dispatch(listSalonsAction({ ...activeFilters, page: 1, isAppend: false }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, activeTab, dispatch]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const activeFilters = getFilterParams(tab, searchInput);
    dispatch(listSalonsAction({ ...activeFilters, page: 1, isAppend: false }));
  };

  const handleRefresh = () => {
    const activeFilters = getFilterParams(activeTab, searchInput);
    dispatch(listSalonsAction({ ...activeFilters, page: 1, isAppend: false }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page || isLoading) return;
    const activeFilters = getFilterParams(activeTab, searchInput);
    dispatch(listSalonsAction({ ...activeFilters, page: newPage, isAppend: false }));
  };

  const handleLoadMore = () => {
    if (isLoading || !hasMore) return;
    const activeFilters = getFilterParams(activeTab, searchInput);
    dispatch(listSalonsAction({ ...activeFilters, page: page + 1, isAppend: true }));
  };

  const statusOptions = [
    { value: "all", label: "All Tenants" },
    { value: "trial", label: "Active Trials" },
    { value: "active", label: "Subscribed" },
    { value: "expired", label: "Expired" },
    { value: "suspended", label: "Suspended" },
  ];

  const totalSalons = totalTenants || total || salons.length;

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
          <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5 shrink-0">
            <PlusCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Provision Salon</span>
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border p-5">
          <div className="flex flex-col md:flex-row gap-5 justify-between w-full">
            <CardTitle className="text-base sm:text-lg">Salon Owners & Tenants Directory</CardTitle>
            <CardTitle className="text-base sm:text-lg">Total Tenant: {total}</CardTitle>
          </div>
        </CardHeader>

        <div className="p-4 sm:px-6 border-b border-border bg-muted/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:flex-1 sm:max-w-md">
              <Input
                value={searchInput}
                placeholder="Search by name, email, or subdomain..."
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    const target = e.currentTarget;
                    const cursor = target.selectionStart ?? 0;
                    if (cursor === 0 || target.value[cursor - 1] === " ") {
                      e.preventDefault();
                    }
                  }
                }}
                onChange={(e) => {
                  const sanitized = sanitizeSearchQuery(e.target.value);
                  hasUserTypedRef.current = true;
                  setSearchInput(sanitized);
                }}
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
          <SalonsTable
            salons={salons}
            isLoading={isLoading}
            page={page}
            total={total}
            hasMore={hasMore}
            limit={limit}
            onPageChange={handlePageChange}
            onLoadMore={handleLoadMore}
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
