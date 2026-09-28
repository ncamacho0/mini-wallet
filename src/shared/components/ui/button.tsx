import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/classnames";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-visible:ring-primary inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-opacity focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
        variant === "secondary" && "border-border bg-card hover:bg-muted border",
        variant === "ghost" && "hover:bg-muted",
        variant === "danger" && "bg-danger text-white hover:opacity-90",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        className,
      )}
      {...props}
    />
  );
}
