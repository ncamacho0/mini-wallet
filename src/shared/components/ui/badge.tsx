import { cn } from "@/shared/lib/classnames";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "muted";
}

export function Badge({ children, variant = "muted" }: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "success" && "bg-success/15 text-success",
        variant === "danger" && "bg-danger/15 text-danger",
        variant === "warning" && "bg-warning/15 text-warning",
        variant === "muted" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
