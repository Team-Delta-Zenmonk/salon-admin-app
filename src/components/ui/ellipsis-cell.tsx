import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "./tooltip";
import { cn } from "@/lib/utils";

export interface EllipsisCellProps extends React.HTMLAttributes<HTMLElement> {
  value?: string | null;
  maxLines?: number;
  maxChars?: number;
  className?: string;
  wrapperClassName?: string;
  as?: any;
  tooltipContent?: React.ReactNode;
  children?: React.ReactNode;
  forceTooltip?: boolean;
}

export const EllipsisCell: React.FC<EllipsisCellProps> = ({
  value,
  maxLines = 1,
  maxChars,
  className,
  wrapperClassName,
  as: Component = "div",
  tooltipContent,
  children,
  forceTooltip = false,
  ...props
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLElement | null>(null);

  const isCharTruncated = Boolean(maxChars && value && value.length > maxChars);
  const displayValue = isCharTruncated ? `${value?.slice(0, maxChars)}...` : (value || "");

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkOverflow = () => {
      const target = (element.querySelector("input, textarea") as HTMLElement) || element;
      const hasHorizontalOverflow = target.scrollWidth > target.clientWidth + 1;
      const hasVerticalOverflow = target.scrollHeight > target.clientHeight + 1;
      setIsOverflowing(isCharTruncated || hasHorizontalOverflow || hasVerticalOverflow);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [value, maxLines, isCharTruncated]);

  if (!value && !children) return null;

  const multilineStyles: React.CSSProperties | undefined =
    maxLines > 1
      ? {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: maxLines,
          overflow: "hidden",
        }
      : undefined;

  return (
    <Tooltip
      content={tooltipContent || value}
      disabled={(!isOverflowing && !forceTooltip && !isCharTruncated) || !value}
      wrapperClassName={cn(children ? "w-full min-w-0 block" : "", wrapperClassName)}
    >
      <Component
        ref={textRef as any}
        style={multilineStyles}
        className={cn(
          children
            ? "w-full min-w-0 max-w-full block"
            : cn(
                "overflow-hidden min-w-0 max-w-full",
                maxLines === 1 ? "truncate block" : "break-words"
              ),
          className
        )}
        {...props}
      >
        {children || displayValue}
      </Component>
    </Tooltip>
  );
};

