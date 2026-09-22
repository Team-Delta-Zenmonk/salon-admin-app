import React from "react";
import {
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import type { SalonItem } from "@/features/salons";
import { formatDate } from "@/lib/utils";
import { getStorefrontUrl, getSubdomainDisplay } from "@/lib/domain";
import { EllipsisCell } from "@/components/ui/ellipsis-cell";
import { SalonStatusBadge } from "./salon-status-badge";
import { getSalonExpiryCountdown } from "../salons.utils";
import { SalonActions } from "./salon-actions";

export interface SalonCardProps {
  salon: SalonItem;
  onExtendTrial: (salon: SalonItem) => void;
  onOverridePlan: (salon: SalonItem) => void;
  onToggleStatus: (salon: SalonItem) => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  onExtendTrial,
  onOverridePlan,
  onToggleStatus,
}) => {
  const { targetDate, countdown, isSuspended } = getSalonExpiryCountdown(salon);

  return (
    <div className="p-4 sm:p-5 hover:bg-muted/20 transition-colors flex flex-col justify-between gap-3 text-left">
      {/* Top: Name & Subdomain + Badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <EllipsisCell
            as="h3"
            value={salon.name}
            className="font-bold text-foreground text-sm"
          />
          <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
            <EllipsisCell
              value={getSubdomainDisplay(salon.slug)}
              className="font-mono text-xs text-primary font-medium"
            />
            <a
              href={getStorefrontUrl(salon.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
              title="Visit Public Storefront"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <span className="capitalize text-[10px] font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            {salon.subscription_plan}
          </span>
          <SalonStatusBadge salon={salon} />
        </div>
      </div>

      {/* Middle Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-muted/40 border border-border/40">
        <div className="min-w-0 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Contact
          </span>
          <div className="text-foreground font-medium text-[11px] flex items-center gap-1.5 min-w-0">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <EllipsisCell
              value={salon.email}
              className="text-foreground font-medium text-[11px]"
            />
          </div>
          {salon.phone && (
            <div className="text-muted-foreground text-[10px] flex items-center gap-1.5 min-w-0">
              <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
              <EllipsisCell
                value={salon.phone}
                className="text-muted-foreground font-mono text-[10px] pt-1"
              />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Expiry / Status
          </span>
          {isSuspended ? (
            <p className="text-muted-foreground font-mono text-[11px]">
              Access Locked
            </p>
          ) : targetDate ? (
            <div>
              <p
                className={`font-semibold font-mono text-[11px] ${countdown.isExpired
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                  }`}
              >
                {countdown.text}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDate(targetDate)}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-[11px]">
              Not specified
            </p>
          )}
        </div>
      </div>

      {/* Footer: Date & Quick Actions */}
      <div className="space-y-2 pt-1 border-t border-border/40">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Joined</span>
          <span className="font-medium text-foreground">{formatDate(salon.created_at)}</span>
        </div>

        <SalonActions
          salon={salon}
          onExtendTrial={onExtendTrial}
          onOverridePlan={onOverridePlan}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </div>
  );
};

export interface SalonsCardsProps {
  salons: SalonItem[];
  onExtendTrial: (salon: SalonItem) => void;
  onOverridePlan: (salon: SalonItem) => void;
  onToggleStatus: (salon: SalonItem) => void;
}

export const SalonsCards: React.FC<SalonsCardsProps> = ({
  salons,
  onExtendTrial,
  onOverridePlan,
  onToggleStatus,
}) => {
  return (
    <div className="divide-y divide-border">
      {salons.map((salon) => (
        <SalonCard
          key={salon.uuid}
          salon={salon}
          onExtendTrial={onExtendTrial}
          onOverridePlan={onOverridePlan}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};
