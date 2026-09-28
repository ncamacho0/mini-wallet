import { cn } from "@/shared/lib/classnames";

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("bg-muted animate-pulse rounded", className)} />;
}
