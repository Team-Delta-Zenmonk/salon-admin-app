import React from "react";
import type { SalonItem } from "@/features/salons";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { isSalonSuspended, getSalonStatusBadgeVariant } from "../salons.utils";

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

  return (
    <Badge variant={variant} size={size} withDot className={className}>
      {isSuspended ? "Suspended" : salon.subscription_status}
    </Badge>
  );
};

