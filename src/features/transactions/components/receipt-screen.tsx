"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ErrorState } from "@/shared/components/ui/error-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { useTransaction } from "../hooks/use-transaction";

export interface ReceiptScreenProps {
  id: string;
}

export function ReceiptScreen({ id }: ReceiptScreenProps) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useTransaction(id);

  if (isLoading) {
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

  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar el comprobante"
        message={error?.message ?? "Intenta de nuevo"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) return null;

  const transaction = data.transaction;

  return (
    <Card className="flex flex-col gap-6">
      <div>
        <p className="text-success text-sm font-medium">Transacción exitosa</p>
        <h1 className="text-2xl font-semibold">Comprobante</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground text-xs">Monto</p>
          <p className="font-semibold">{formatCurrency(transaction.amountMinorUnits)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Destinatario</p>
          <p className="font-semibold">{transaction.recipientName}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Referencia</p>
          <p className="font-semibold">{transaction.reference}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Fecha</p>
          <p className="font-semibold">{formatDate(transaction.createdAt)}</p>
        </div>
      </div>

      <Badge variant="success">Completada</Badge>

      <Button onClick={() => router.push("/home")}>Volver al inicio</Button>
    </Card>
  );
}
