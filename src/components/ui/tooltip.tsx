import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  wrapperClassName?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  disabled = false,
  side = "top",
  className,
  wrapperClassName,
  delay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0) {
      return null;
    }

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl && tooltipEl.offsetWidth > 0 ? tooltipEl.offsetWidth : 120;
    const tooltipHeight = tooltipEl && tooltipEl.offsetHeight > 0 ? tooltipEl.offsetHeight : 28;

    let top = 0;
    let left = 0;
    const padding = 8;

    if (side === "top") {
      if (rect.top - tooltipHeight - 6 < padding) {
        top = rect.bottom + 6;
      } else {
        top = rect.top - tooltipHeight - 6;
      }
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (side === "bottom") {
      if (rect.bottom + tooltipHeight + 6 > window.innerHeight - padding) {
        top = rect.top - tooltipHeight - 6;
      } else {
        top = rect.bottom + 6;
      }
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (side === "left") {
      if (rect.left - tooltipWidth - 6 < padding) {
        left = rect.right + 6;
      } else {
        left = rect.left - tooltipWidth - 6;
      }
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
    } else if (side === "right") {
      if (rect.right + tooltipWidth + 6 > window.innerWidth - padding) {
        left = rect.left - tooltipWidth - 6;
      } else {
        left = rect.right + 6;
      }
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
    }

    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    return { top, left };
  }, [side]);

  const updatePosition = useCallback(() => {
    const newCoords = calculatePosition();
    if (newCoords) {
      setCoords(newCoords);
      setIsPositioned(true);
    }
  }, [calculatePosition]);

  const showTooltip = () => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const initialCoords = calculatePosition();
      if (initialCoords) {
        setCoords(initialCoords);
      }
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setIsPositioned(false);
  };

  useEffect(() => {
    if (disabled) {
      hideTooltip();
    }
  }, [disabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    } else {
      setIsPositioned(false);
    }
  }, [isVisible, updatePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={cn("inline-block max-w-full min-w-0 align-bottom", wrapperClassName)}
      >
        {children}
      </span>
      {isVisible &&
        !disabled &&
        content &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              visibility: isPositioned ? "visible" : "hidden",
            }}
            role="tooltip"
            className={cn(
              "z-[9999] pointer-events-none max-w-xs break-all sm:break-words [overflow-wrap:anywhere] rounded-lg border border-border bg-popover px-2.5 py-1 text-xs text-popover-foreground shadow-lg",
              isPositioned && "animate-in fade-in-0 zoom-in-95",
              className
            )}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

