import React, { useState } from "react";
import dayjs from "dayjs";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SalonItem } from "@/features/salons/list-salons/list-salons.service";
import { useAppDispatch } from "@/store/hooks";
import { updateSalonPlanAction } from "@/features/salons/update-salon-plan/update-salon-plan.action";

interface ExtendTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: SalonItem | null;
}

export const ExtendTrialModal: React.FC<ExtendTrialModalProps> = ({
  isOpen,
  onClose,
  salon,
}) => {
  const dispatch = useAppDispatch();
  const [days, setDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!salon) return null;

  const currentBase =
    salon.trial_ends_at && new Date(salon.trial_ends_at) > new Date()
      ? new Date(salon.trial_ends_at)
      : new Date();
  const projectedDate = dayjs(currentBase).add(days || 0, "day").format("MMMM D, YYYY h:mm A");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!days || days <= 0) {
      setError("Please enter a valid number of days (> 0)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await dispatch(
        updateSalonPlanAction({
          uuid: salon.uuid,
          payload: {
            extend_trial_days: Number(days),
            subscription_status: "trial",
          },
        })
      ).unwrap();

      onClose();
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to extend trial period");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Extend Salon Trial Period"
      description={`Grant supplementary trial days to "${salon.name}".`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border bg-background p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current Status:</span>
            <span className="font-semibold uppercase text-amber-600 dark:text-amber-400">
              {salon.subscription_status}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current Trial Ends:</span>
            <span className="font-medium text-foreground">
              {salon.trial_ends_at
                ? dayjs(salon.trial_ends_at).format("MMM D, YYYY")
                : "Not set / Expired"}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wide text-foreground mb-2">
            Quick Extension Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[7, 14, 30].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDays(preset)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                  days === preset
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                +{preset} Days
              </button>
            ))}
          </div>
        </div>

        <Input
          type="number"
          min="1"
          max="365"
          label="Custom Additional Days"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value) || 0)}
          leftIcon={<Calendar className="h-4 w-4" />}
          helperText="Additive: days will be added on top of existing remaining time."
        />

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3">
          <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-foreground block">
              New Projected Expiration Date
            </span>
            <span className="text-primary font-mono text-sm font-semibold">
              {projectedDate}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Apply Trial Extension
          </Button>
        </div>
      </form>
    </Modal>
  );
};
