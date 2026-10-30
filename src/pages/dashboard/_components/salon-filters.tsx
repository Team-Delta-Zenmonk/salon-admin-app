import React, { useState, useRef, useEffect } from "react";
import { Filter, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TIER_OPTIONS, STATUS_OPTIONS } from "./salon-filters.constants";

export interface SalonFiltersProps {
  selectedPlan: string;
  selectedStatuses: string[];
  onApply: (plan: string, statuses: string[]) => void;
  onReset: () => void;
  className?: string;
}

export const SalonFilters: React.FC<SalonFiltersProps> = ({
  selectedPlan,
  selectedStatuses,
  onApply,
  onReset,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPlan, setTempPlan] = useState<string>(selectedPlan);
  const [tempStatuses, setTempStatuses] = useState<string[]>(selectedStatuses);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeCount =
    (selectedPlan !== "all" ? 1 : 0) + selectedStatuses.length;

  const handleToggleOpen = () => {
    if (!isOpen) {
      setTempPlan(selectedPlan);
      setTempStatuses(selectedStatuses);
    }
    setIsOpen((prev) => !prev);
  };

  const handleStatusToggle = (value: string) => {
    setTempStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleReset = () => {
    setTempPlan("all");
    setTempStatuses([]);
    onReset();
    setIsOpen(false);
  };

  const handleApply = () => {
    onApply(tempPlan, tempStatuses);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          "gap-2 border-border font-medium cursor-pointer",
          (isOpen || activeCount > 0) && "border-primary/60 text-foreground"
        )}
      >
        <Filter className={cn("h-4 w-4", activeCount > 0 ? "text-primary" : "text-muted-foreground")} />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
            {activeCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Filter options"
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-card p-4 text-foreground shadow-xl shadow-black/10 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Filter Directory</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="py-3 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Subscription Tier
              </div>
              <div className="space-y-1">
                {TIER_OPTIONS.map((tier) => {
                  const isChecked = tempPlan === tier.value;
                  return (
                    <label
                      key={tier.value}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
                        isChecked
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="tier-filter"
                          value={tier.value}
                          checked={isChecked}
                          onChange={() => setTempPlan(tier.value)}
                          className="h-3.5 w-3.5 border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                        />
                        <span>{tier.label}</span>
                      </div>
                      {isChecked && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Subscription Status (Multi Choice Checkbox) */}
            <div className="pt-2 border-t border-border">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Subscription Status
              </div>
              <div className="space-y-1">
                {STATUS_OPTIONS.map((status) => {
                  const isChecked = tempStatuses.includes(status.value);
                  return (
                    <label
                      key={status.value}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
                        isChecked
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          name="status-filter"
                          value={status.value}
                          checked={isChecked}
                          onChange={() => handleStatusToggle(status.value)}
                          className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                        />
                        <span>{status.label}</span>
                      </div>
                      {isChecked && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="flex-1 text-xs cursor-pointer"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
