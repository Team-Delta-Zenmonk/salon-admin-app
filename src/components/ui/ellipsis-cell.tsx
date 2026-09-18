import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "./tooltip";
import { cn } from "@/lib/utils";

export interface EllipsisCellProps extends React.HTMLAttributes<HTMLElement> {
  value?: string | null;
  maxLines?: number;
  className?: string;
  as?: "div" | "span" | "p" | "h3" | "h4";
  tooltipContent?: React.ReactNode;
}

export const EllipsisCell: React.FC<EllipsisCellProps> = ({
  value,
  maxLines = 1,
  className,
  as: Component = "div",
  tooltipContent,
  ...props
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkOverflow = () => {
      const hasHorizontalOverflow = element.scrollWidth > element.clientWidth + 1;
      const hasVerticalOverflow = element.scrollHeight > element.clientHeight + 1;
      setIsOverflowing(hasHorizontalOverflow || hasVerticalOverflow);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [value, maxLines]);

  if (!value) return null;

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
    <Tooltip content={tooltipContent || value} disabled={!isOverflowing}>
      <Component
        ref={textRef as any}
        style={multilineStyles}
        className={cn(
          "overflow-hidden",
          maxLines === 1 ? "truncate block" : "break-words",
          className
        )}
        {...props}
      >
        {value}
      </Component>
    </Tooltip>
  );
};

