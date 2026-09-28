import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card
        className="w-full max-w-sm"
        role="status"
        aria-busy="true"
        aria-label="Cargando inicio de sesión"
      >
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-2 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  );
}
