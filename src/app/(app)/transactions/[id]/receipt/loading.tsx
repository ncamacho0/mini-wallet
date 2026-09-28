import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ReceiptLoading() {
  return (
    <Card
      className="flex flex-col gap-4"
      role="status"
      aria-busy="true"
      aria-label="Cargando comprobante"
    >
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  );
}
