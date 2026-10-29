import React from "react";
import {
  Building2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { SalonItem } from "@/features/salons";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatDate } from "@/lib/utils";
import { getStorefrontUrl, getSubdomainDisplay } from "@/lib/domain";
import { EllipsisCell } from "@/components/ui/ellipsis-cell";
import { SalonStatusBadge } from "./salon-status-badge";
import { getSalonExpiryCountdown } from "../salons.utils";
import { SalonActions } from "./salon-actions";
import { SalonsMobileView } from "./salons-mobile-view";

export interface SalonsTableProps {
  salons: SalonItem[];
  isLoading?: boolean;
  page?: number;
  total?: number;
  limit?: number;
  hasMore?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRetry?: () => void;
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
  onExtendTrial: (salon: SalonItem) => void;
  onOverridePlan: (salon: SalonItem) => void;
  onToggleStatus: (salon: SalonItem) => void;
}

export const SalonsTable: React.FC<SalonsTableProps> = ({
  salons,
  isLoading = false,
  page = 1,
  total = 0,
  limit = 20,
  hasMore = false,
  error,
  emptyMessage = "No salon tenants match the current query.",
  onRetry,
  onPageChange,
  onLoadMore,
  onExtendTrial,
  onOverridePlan,
  onToggleStatus,
}) => {
  if (isLoading && salons.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
        Fetching salon tenants...
      </div>
    );
  }

  if (error && salons.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-destructive font-semibold mb-2">{error}</div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5 shrink-0" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="hidden min-[700px]:block">
        <div className="relative overflow-x-auto min-h-[500px]">
          {isLoading && salons.length > 0 && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2.5 px-4 sm:px-6">Tenant & Subdomain</th>
                <th className="py-2.5 px-4">Contact Info</th>
                <th className="py-2.5 px-4">Tier</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Plan/Trial Expiry</th>
                <th className="py-2.5 px-4">Created</th>
                <th className="py-2.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {salons.map((salon) => {
                const { targetDate, countdown, isSuspended, hasCombinedExpiry, trialEndsAt } =
                  getSalonExpiryCountdown(salon);

                return (
                  <tr
                    key={salon.uuid}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-2.5 px-4 sm:px-6 max-w-[200px]">
                      <EllipsisCell
                        value={salon.name}
                        className="font-bold text-foreground text-sm"
                      />
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                        <EllipsisCell
                          value={getSubdomainDisplay(salon.slug)}
                          className="font-mono text-[11px] text-primary font-medium"
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
                    </td>

                    <td className="py-2.5 px-4 max-w-[180px]">
                      <div className="flex flex-col min-w-0">
                        <EllipsisCell
                          value={salon.email}
                          className="text-foreground font-medium"
                        />
                        {salon.phone && (
                          <EllipsisCell
                            value={salon.phone}
                            className="text-[11px] text-muted-foreground font-mono mt-0.5"
                          />
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <EllipsisCell
                        value={salon.subscription_plan}
                        maxChars={10}
                        className="capitalize font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border"
                      />
                    </td>

                    <td className="py-2.5 px-4">
                      <SalonStatusBadge salon={salon} />
                    </td>

                    <td className="py-2.5 px-4">
                      {isSuspended ? (
                        <span className="text-muted-foreground font-mono">Access Locked</span>
                      ) : targetDate ? (
                        <div>
                          <span
                            className={`font-semibold font-mono ${
                              countdown.isExpired ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {countdown.text}
                          </span>
                          <div className="text-[10px] text-muted-foreground">
                            Plan: {formatDate(targetDate)}
                          </div>
                          {hasCombinedExpiry && trialEndsAt && (
                            <div className="text-[9px] text-muted-foreground/80 mt-0.5 font-mono">
                              Trial: {formatDate(trialEndsAt)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No Expiry</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-muted-foreground text-[11px]">
                      {formatDate(salon.created_at)}
                    </td>

                    <td className="py-2.5 px-4 sm:px-6 text-right">
                      <SalonActions
                        salon={salon}
                        onExtendTrial={onExtendTrial}
                        onOverridePlan={onOverridePlan}
                        onToggleStatus={onToggleStatus}
                        className="justify-end"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {onPageChange && (
          <TablePagination
            total={total}
            page={page}
            limit={limit}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        )}
      </div>

      <SalonsMobileView
        salons={salons}
        total={total}
        page={page}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={onLoadMore || (() => {})}
        onExtendTrial={onExtendTrial}
        onOverridePlan={onOverridePlan}
        onToggleStatus={onToggleStatus}
      />
    </>
  );
};
