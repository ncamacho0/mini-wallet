import { cn } from "@/shared/lib/classnames";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn("border-border bg-card rounded-xl border p-4 shadow-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
