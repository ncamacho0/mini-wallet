export interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border-border flex flex-col items-center gap-1 rounded-xl border border-dashed p-6 text-center">
      <p className="font-medium">{title}</p>
      {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
    </div>
  );
}
