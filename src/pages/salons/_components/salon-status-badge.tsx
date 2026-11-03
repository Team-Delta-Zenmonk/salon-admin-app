import React from "react";
import type { SalonItem } from "@/features/salons";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { isSalonSuspended, getSalonStatusBadgeVariant } from "../salons.utils";
import { cn } from "@/lib/utils";

export interface SalonStatusBadgeProps {
  salon: SalonItem;
  size?: BadgeProps["size"];
  className?: string;
}

export const SalonStatusBadge: React.FC<SalonStatusBadgeProps> = ({
  salon,
  size = "sm",
  className,
}) => {
  const isSuspended = isSalonSuspended(salon);
  const variant = getSalonStatusBadgeVariant(salon);

  const label = isSuspended
    ? "Suspended"
    : variant
    ? variant.charAt(0).toUpperCase() + variant.slice(1)
    : "";

  return (
    <Badge variant={variant} size={size} withDot className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
};

