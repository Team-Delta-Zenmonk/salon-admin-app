import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EllipsisCell } from "./ellipsis-cell";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  preventClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  preventClose = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setIsClosing(false);
    } else if (mounted) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !preventClose) {
        onClose();
      }
    };
    if (mounted) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, isOpen, onClose, preventClose]);

  if (!mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center">
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-xs",
          isClosing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"
        )}
        onClick={() => {
          if (!preventClose) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 w-full max-h-[calc(100dvh-1.75rem)] sm:max-h-[calc(100dvh-3.5rem)] flex flex-col rounded-lg border border-border bg-card text-foreground shadow-2xl my-auto min-w-0 overflow-hidden",
          maxWidthClasses,
          isClosing ? "animate-modal-content-out" : "animate-modal-content-in"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6 sm:py-4 min-w-0">
          <div className="min-w-0 flex-1 pr-1">
            <h3 id="modal-title" className="text-base sm:text-lg font-bold text-foreground tracking-tight break-words">
              <EllipsisCell value={title?.toString() ?? ""} />
            </h3>
            {description && (
              <div className="mt-1 text-xs sm:text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!preventClose) {
                onClose();
              }
            }}
            disabled={preventClose}
            className={cn(
              "shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors -mr-1 -mt-0.5",
              preventClose
                ? "opacity-30 cursor-not-allowed pointer-events-none"
                : "hover:bg-muted hover:text-foreground cursor-pointer"
            )}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 px-4 py-4 sm:px-6 sm:py-5 overscroll-contain">
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-4 py-3 sm:px-6 sm:py-4 bg-muted/20 min-w-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
