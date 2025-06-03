/**
 * Basic Skeleton Component
 * Simple skeleton loader for consistent loading states
 */
import React from "react";
import { cn } from "../../utils/theme/tailwind";

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  "aria-label"?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  animate = true,
  "aria-label": ariaLabel = "Loading content...",
}) => {
  return (
    <div
      className={cn(
        "bg-muted rounded-md",
        animate && "animate-pulse",
        className,
      )}
      role="status"
      aria-label={ariaLabel}
    />
  );
};

export default Skeleton;
