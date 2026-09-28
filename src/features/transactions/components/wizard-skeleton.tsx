import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function WizardSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-busy="true"
      aria-label="Cargando envío de dinero"
    >
      <Card>
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  );
}
