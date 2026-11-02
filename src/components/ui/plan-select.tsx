import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, Check, RefreshCw, Zap, Sparkles, Calendar } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionPlans } from "@/features/plans/plans.action";
import { cn } from "@/lib/utils";

export interface PlanSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  filterOutTrial?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  trial: <Sparkles className="h-4 w-4 text-amber-500" />,
  monthly: <Calendar className="h-4 w-4 text-blue-500" />,
  yearly: <Zap className="h-4 w-4 text-emerald-500" />,
};

const DEFAULT_TRIAL_PLAN = {
  id: "trial",
  rawId: "trial",
  uuid: "trial",
  name: "Free Trial",
  price: "Free",
  description: "Standard platform trial",
  icon: <Sparkles className="h-4 w-4 text-amber-500" />,
};

export const PlanSelect: React.FC<PlanSelectProps> = ({
  value,
  onChange,
  placeholder = "Select subscription plan...",
  error,
  className,
  filterOutTrial = false,
}) => {
  const dispatch = useAppDispatch();
  const {
    plans: allBackendPlans,
    page,
    hasMore,
    isLoading: isLoadingPlans,
  } = useAppSelector((state) => state.plans);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const backendPlans = allBackendPlans.filter((p) => {
    if (filterOutTrial && (p.code === "trial" || p.id === "trial")) return false;
    if (p.is_active === false) return false;
    return true;
  });

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchSubscriptionPlans({ page: 1, limit: 10 }));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadMorePlans = useCallback(() => {
    if (isLoadingPlans || !hasMore) return;
    dispatch(fetchSubscriptionPlans({ page: page + 1, limit: 10 }));
  }, [dispatch, page, hasMore, isLoadingPlans]);

  const fetchedOptions = backendPlans.map((p) => {
    const durationLabel =
      p.duration_days != null
        ? `${p.duration_days} ${p.duration_days === 1 ? "Day" : "Days"}`
        : (p.billing_cycle || "");

    return {
      id: p.code || String(p.id),
      rawId: p.id,
      uuid: p.uuid,
      name: p.name,
      price:
        p.formatted_price === "Free"
          ? "Free"
          : `${p.formatted_price} ${durationLabel}`.trim(),
      description: p.description,
      icon: iconMap[p.code || String(p.id)] || <Zap className="h-4 w-4 text-primary" />,
    };
  });

  const hasTrialInFetched = fetchedOptions.some(
    (p) => p.id === "trial" || p.rawId === "trial" || p.uuid === "trial"
  );

  const planOptions =
    !filterOutTrial && !hasTrialInFetched
      ? [DEFAULT_TRIAL_PLAN, ...fetchedOptions]
      : fetchedOptions;

  const selectedPlan =
    planOptions.find((p) => p.id === value || p.uuid === value || p.rawId === value) ||
    (!filterOutTrial && (value === "trial" || !value) ? DEFAULT_TRIAL_PLAN : null);

  return (
    <div className={cn("relative w-full text-left", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border bg-card px-3.5 py-2.5 text-xs text-foreground transition-all duration-150 cursor-pointer",
          isOpen
            ? "border-primary ring-2 ring-primary/20 shadow-xs"
            : "border-border hover:border-foreground/30 hover:bg-muted/20",
          error && "border-destructive focus:border-destructive"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 text-primary">
            {selectedPlan?.icon || <Zap className="h-4 w-4" />}
          </span>
          <span className="font-semibold text-foreground truncate">
            {selectedPlan?.name || (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </span>
          {selectedPlan && (
            <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
              {selectedPlan.price}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {isOpen && (
        <div
          id="reusable-plan-select-dropdown"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-card p-1.5 text-foreground shadow-xl animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {isLoadingPlans && planOptions.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs font-medium">Fetching plans...</span>
            </div>
          ) : planOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No active plans found.
            </div>
          ) : (
            <InfiniteScroll
              dataLength={planOptions.length}
              next={loadMorePlans}
              hasMore={hasMore}
              scrollableTarget="reusable-plan-select-dropdown"
              loader={
                <div className="py-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Loading more...</span>
                </div>
              }
            >
              <div className="flex flex-col gap-1">
                {planOptions.map((plan) => {
                  const isSelected =
                    value === plan.id || value === plan.uuid || value === plan.rawId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(plan.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer text-left",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="shrink-0">{plan.icon}</span>
                        <div className="min-w-0 flex flex-col">
                          <span className="font-bold truncate">{plan.name}</span>
                          <span
                            className={cn(
                              "text-[10px] truncate",
                              isSelected
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {plan.description || "No description"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "font-bold px-1.5 py-0.5 rounded text-[11px]",
                            isSelected
                              ? "bg-white/20 text-white"
                              : "text-primary bg-primary/10"
                          )}
                        >
                          {plan.price}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </InfiniteScroll>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
};
