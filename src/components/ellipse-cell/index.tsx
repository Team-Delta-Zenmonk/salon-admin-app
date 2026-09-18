import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

export interface EllipsisCellProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string;
  maxLines?: number;
  maxChars?: number;
  className?: string;
  forceTooltip?: boolean;
  children?: React.ReactNode;
}

export const EllipsisCell: React.FC<EllipsisCellProps> = ({
  value,
  maxLines = 1,
  maxChars,
  className,
  forceTooltip = false,
  children,
  ...props
}) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const isCharTruncated = Boolean(maxChars && value && value.length > maxChars);
  const displayValue = isCharTruncated ? `${value.slice(0, maxChars)}...` : (value || "");

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkOverflow = () => {
      setIsOverflowing(
        isCharTruncated ||
          element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight
      );
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value, maxChars, isCharTruncated]);

  const updatePosition = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setTooltipPos({
        top: Math.max(10, rect.top - 36),
        left: Math.max(20, Math.min(window.innerWidth - 20, rect.left + rect.width / 2)),
      });
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (isOverflowing || forceTooltip || isCharTruncated) {
      updatePosition();
      setShowTooltip(true);
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTooltip(false);
    props.onMouseLeave?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (isOverflowing || forceTooltip || isCharTruncated) {
      updatePosition();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 250);
    }
    props.onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowTooltip(false);
    props.onMouseUp?.(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLSpanElement>) => {
    if (isOverflowing || forceTooltip || isCharTruncated) {
      updatePosition();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 250);
    }
    props.onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLSpanElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowTooltip(false);
    props.onTouchEnd?.(e);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const portalContent = showTooltip && Boolean(value) && typeof window !== "undefined" && (
    <div
      className="fixed z-[99999] px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-2xl border border-neutral-700 pointer-events-none max-w-[280px] sm:max-w-xs break-words text-center -translate-x-1/2 animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${tooltipPos.top}px`,
        left: `${tooltipPos.left}px`,
      }}
    >
      {value}
    </div>
  );

  return (
    <>
      <span
        ref={elementRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => {
          if (showTooltip) e.preventDefault();
        }}
        className={cn(
          "overflow-hidden text-ellipsis min-w-0 max-w-full pointer-events-auto [&_*]:pointer-events-auto select-none",
          maxLines === 1 ? "inline-block whitespace-nowrap truncate" : "line-clamp-none",
          className
        )}
        style={
          maxLines > 1
            ? {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: maxLines,
                wordBreak: "break-word",
              }
            : undefined
        }
        {...props}
      >
        {children || displayValue}
      </span>
      {portalContent && ReactDOM.createPortal(portalContent, document.body)}
    </>
  );
};

export default EllipsisCell;
