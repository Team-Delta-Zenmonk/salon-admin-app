import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { SalonItem } from "@/features/salons";
import { SalonsCards } from "./salon-card";

export interface SalonsMobileViewProps {
  salons: SalonItem[];
  total: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onExtendTrial: (salon: SalonItem) => void;
  onOverridePlan: (salon: SalonItem) => void;
  onToggleStatus: (salon: SalonItem) => void;
}

export const SalonsMobileView: React.FC<SalonsMobileViewProps> = ({
  salons,
  hasMore,
  isLoading,
  onLoadMore,
  onExtendTrial,
  onOverridePlan,
  onToggleStatus,
}) => {
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    hasMoreRef.current = hasMore;
    onLoadMoreRef.current = onLoadMore;
  }, [isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 700) {
        return;
      }

      if (isLoadingRef.current || !hasMoreRef.current) {
        return;
      }

      const container = document.getElementById("admin-main-content");
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop > 20 && scrollHeight > clientHeight && scrollHeight - (scrollTop + clientHeight) < 100) {
          isLoadingRef.current = true; // Synchronously lock to block rapid duplicate scroll events
          onLoadMoreRef.current();
          return;
        }
      }

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > 20 && documentHeight > windowHeight && documentHeight - (scrollY + windowHeight) < 100) {
        isLoadingRef.current = true; // Synchronously lock
        onLoadMoreRef.current();
      }
    };

    const container = document.getElementById("admin-main-content");
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-[700px]:hidden">
      <SalonsCards
        salons={salons}
        onExtendTrial={onExtendTrial}
        onOverridePlan={onOverridePlan}
        onToggleStatus={onToggleStatus}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading more salon tenants...</span>
        </div>
      )}

      {!hasMore && salons.length > 0 && (
        <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <div className="w-12 h-px bg-border/50"></div>
          <span>Showing all {salons.length} salon tenants</span>
          <div className="w-12 h-px bg-border/50"></div>
        </div>
      )}
    </div>
  );
};
