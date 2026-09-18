import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { SalonItem } from "@/features/salons/list-salons/list-salons.service";
import { useAppDispatch } from "@/store/hooks";
import { updateSalonStatusAction } from "@/features/salons/update-salon-status/update-salon-status.action";
import { getSubdomainDisplay } from "@/lib/domain";

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

  const handleConfirm = async () => {
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

      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to update salon status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={willSuspend ? "Suspend Salon Access" : "Reactivate Salon"}
      description={
        willSuspend
          ? `Are you sure you want to suspend "${salon.name}"?`
          : `Restore platform operations and storefront for "${salon.name}".`
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {willSuspend ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
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
              <div className="text-xs space-y-1">
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

        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Salon Name:</span>
            <span className="font-semibold text-foreground">{salon.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subdomain:</span>
            <span className="font-mono text-primary font-medium">{getSubdomainDisplay(salon.slug)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Owner Email:</span>
            <span className="text-foreground">{salon.email}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
            className="w-full sm:w-auto"
          >
            {willSuspend ? "Confirm Suspension" : "Confirm Reactivation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
