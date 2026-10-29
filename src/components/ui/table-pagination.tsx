import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export interface TablePaginationProps {
  total: number;
  page: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

const getPageNumbers = (current: number, totalPages: number): (number | string)[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }
  if (current >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", current - 1, current, current + 1, "...", totalPages];
};

export const TablePagination: React.FC<TablePaginationProps> = ({
  total,
  page,
  limit = 20,
  onPageChange,
  isLoading = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-muted/5">
      <div className="text-xs text-muted-foreground">
        {total > 0 ? (
          <>
            Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
            <span className="font-semibold text-foreground">{endItem}</span> of{" "}
            <span className="font-semibold text-foreground">{total}</span> tenants
          </>
        ) : (
          "No tenants found"
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground select-none">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${p}`}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                  onClick={() => onPageChange(p as number)}
                  className={`h-8 min-w-8 px-2 text-xs font-medium cursor-pointer ${
                    p === page ? "bg-primary text-primary-foreground shadow-xs font-semibold" : ""
                  }`}
                >
                  {p}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

