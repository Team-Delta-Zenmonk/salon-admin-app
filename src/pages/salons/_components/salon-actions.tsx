import React from "react";
import { Calendar, Zap, ShieldBan, ShieldCheck } from "lucide-react";
import type { SalonItem } from "@/features/salons";
import { Button } from "@/components/ui/button";
import { isSalonSuspended } from "../salons.utils";
import { cn } from "@/lib/utils";

export interface SalonActionsProps {
  salon: SalonItem;
  onExtendTrial: (salon: SalonItem) => void;
  onOverridePlan: (salon: SalonItem) => void;
  onToggleStatus: (salon: SalonItem) => void;
  className?: string;
  size?: "xs" | "sm";
}

export const SalonActions: React.FC<SalonActionsProps> = ({
  salon,
  onExtendTrial,
  onOverridePlan,
  onToggleStatus,
  className,
  size = "xs",
}) => {
  const isSuspended = isSalonSuspended(salon);

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap sm:flex-nowrap", className)}>
      <Button
        variant="secondary"
        size={size}
        className="inline-flex items-center justify-start gap-1 text-[11px] px-2 font-medium shrink-0 w-auto"
        title="Extend Trial"
        onClick={() => onExtendTrial(salon)}
      >
        <Calendar className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>+Trial</span>
      </Button>

      <Button
        variant="secondary"
        size={size}
        className="inline-flex items-center justify-start gap-1 text-[11px] px-2 font-medium shrink-0 w-auto"
        title="Override Entitlement Plan"
        onClick={() => onOverridePlan(salon)}
      >
        <Zap className="h-2.5 w-2.5 text-primary shrink-0" />
        <span>Plan</span>
      </Button>

      <Button
        variant={isSuspended ? "default" : "outline"}
        size={size}
        className="inline-flex items-center justify-start gap-1 text-[11px] px-2 font-medium shrink-0 w-auto"
        title={isSuspended ? "Reactivate Salon" : "Suspend Salon"}
        onClick={() => onToggleStatus(salon)}
      >
        {isSuspended ? (
          <>
            <ShieldCheck className="h-2.5 w-2.5 text-primary-foreground shrink-0" />
            <span>Reactivate</span>
          </>
        ) : (
          <>
            <ShieldBan className="h-2.5 w-2.5 text-destructive shrink-0" />
            <span>Suspend</span>
          </>
        )}
      </Button>
    </div>
  );
};
