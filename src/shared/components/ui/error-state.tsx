import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Algo salió mal",
  message,
  onRetry,
  retryLabel = "Intentar de nuevo",
}: ErrorStateProps) {
  return (
    <div
      className="border-danger/40 bg-danger/10 flex flex-col items-center gap-3 rounded-xl border p-6 text-center"
      role="alert"
    >
      <p className="text-danger font-semibold">{title}</p>
      <p className="text-muted-foreground text-sm">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
