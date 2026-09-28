import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-busy="true"
      aria-label="Cargando inicio"
    >
      <Card className="flex flex-col gap-6">
        <div>
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-12 w-36" />
        </div>
      </Card>
      <Card>
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </Card>
    </div>
  );
}
