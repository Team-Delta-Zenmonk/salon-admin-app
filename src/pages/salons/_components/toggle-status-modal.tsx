import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { EllipsisCell } from "@/components/ui/ellipsis-cell";
import { Tooltip } from "@/components/ui/tooltip";
import type { SalonItem } from "@/features/salons/list-salons/list-salons.service";
import { useAppDispatch } from "@/store/hooks";
import { updateSalonStatusAction } from "@/features/salons/update-salon-status/update-salon-status.action";
import { getSubdomainDisplay } from "@/lib/domain";
import { showSnackbar } from "@/components/ui/snackbar";

interface ToggleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: SalonItem | null;
}

export const ToggleStatusModal: React.FC<ToggleStatusModalProps> = ({
  isOpen,
  onClose,
  salon,
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!salon) return null;

  const willSuspend = salon.is_active && salon.subscription_status !== "suspended";

  const handleClose = (force = false) => {
    if (isSubmitting && !force) return;
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError(null);

      await dispatch(
        updateSalonStatusAction({
          uuid: salon.uuid,
          payload: {
            is_active: !willSuspend,
            subscription_status: willSuspend ? "suspended" : "active",
          },
        })
      ).unwrap();

      setIsSubmitting(false);
      handleClose(true);
      showSnackbar(
        willSuspend
          ? "Salon access suspended successfully"
          : "Salon reactivated successfully"
      );
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to update salon status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleClose()}
      preventClose={isSubmitting}
      title={willSuspend ? "Suspend Salon Access" : "Reactivate Salon"}
      description={
        <span>
          {willSuspend ? (
            <>
              Are you sure you want to suspend{" "}
              <Tooltip content={salon.name} wrapperClassName="inline max-w-full align-baseline">
                <span className="font-semibold text-foreground break-all inline cursor-help">
                  "{salon.name}"
                </span>
              </Tooltip>
              ?
            </>
          ) : (
            <>
              Restore platform operations and storefront for{" "}
              <Tooltip content={salon.name} wrapperClassName="inline max-w-full align-baseline">
                <span className="font-semibold text-foreground break-all inline cursor-help">
                  "{salon.name}"
                </span>
              </Tooltip>
              .
            </>
          )}
        </span>
      }
      maxWidth="md"
    >
      <div className="space-y-4 min-w-0">
        {willSuspend ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 min-w-0 flex-1">
                <span className="font-bold text-destructive">
                  Immediate Operational Consequences:
                </span>
                <ul className="list-disc pl-4 text-foreground/80 space-y-1">
                  <li>Storefront customer online checkout will be immediately halted.</li>
                  <li>Salon owner and staff will see the administrative suspension notice.</li>
                  <li>No new bookings can be created until reactivated.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 min-w-0 flex-1">
                <span className="font-bold text-foreground">
                  Operational Restoration:
                </span>
                <p className="text-muted-foreground">
                  Storefront checkout, staff scheduling, and management console access will be
                  restored immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="text-muted-foreground shrink-0 font-medium">Salon Name:</span>
            <div className="min-w-0 flex-1 flex justify-end">
              <EllipsisCell
                value={salon.name}
                className="font-semibold text-foreground text-right"
                wrapperClassName="min-w-0 max-w-full"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="text-muted-foreground shrink-0 font-medium">Subdomain:</span>
            <div className="min-w-0 flex-1 flex justify-end">
              <EllipsisCell
                value={getSubdomainDisplay(salon.slug)}
                className="font-mono text-primary font-medium text-right"
                wrapperClassName="min-w-0 max-w-full"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="text-muted-foreground shrink-0 font-medium">Owner Email:</span>
            <div className="min-w-0 flex-1 flex justify-end">
              <EllipsisCell
                value={salon.email}
                className="text-foreground text-right"
                wrapperClassName="min-w-0 max-w-full"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="break-all [overflow-wrap:anywhere]">{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose()}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={willSuspend ? "destructive" : "default"}
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {willSuspend ? "Confirm Suspension" : "Confirm Reactivation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
