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
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        variant="secondary"
        size={size}
        className="w-full justify-center text-[11px] px-1 sm:w-auto"
        title="Extend Trial"
        onClick={() => onExtendTrial(salon)}
      >
        <Calendar className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400 shrink-0" />
        +Trial
      </Button>

      <Button
        variant="secondary"
        size={size}
        className="w-full justify-center text-[11px] px-1 sm:w-auto"
        title="Override Entitlement Plan"
        onClick={() => onOverridePlan(salon)}
      >
        <Zap className="h-3 w-3 mr-1 text-primary shrink-0" />
        Plan
      </Button>

      <Button
        variant={isSuspended ? "default" : "outline"}
        size={size}
        className="w-full justify-center text-[11px] px-1 sm:w-auto"
        title={isSuspended ? "Reactivate Salon" : "Suspend Salon"}
        onClick={() => onToggleStatus(salon)}
      >
        {isSuspended ? (
          <>
            <ShieldCheck className="h-3 w-3 mr-1 text-primary-foreground shrink-0" />
            Reactivate
          </>
        ) : (
          <>
            <ShieldBan className="h-3 w-3 mr-1 text-destructive shrink-0" />
            Suspend
          </>
        )}
      </Button>
    </div>
  );
};
