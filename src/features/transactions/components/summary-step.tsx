"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ErrorState } from "@/shared/components/ui/error-state";
import { formatCurrency } from "@/shared/lib/format";
import type { ApiClientError } from "@/shared/lib/api-client";

export interface SummaryStepProps {
  amountMinorUnits: number;
  recipientName: string;
  balanceMinorUnits: number;
  onConfirm: () => void;
  isPending: boolean;
  error: ApiClientError | null;
}

export function SummaryStep({
  amountMinorUnits,
  recipientName,
  balanceMinorUnits,
  onConfirm,
  isPending,
  error,
}: SummaryStepProps) {
  const balanceAfter = balanceMinorUnits - amountMinorUnits;

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Resumen de la transferencia</h2>
        <p className="text-muted-foreground text-sm">Revisa los datos antes de confirmar</p>
      </div>

      <div className="bg-muted flex flex-col gap-3 rounded-lg p-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Monto a enviar</span>
          <span className="font-semibold">{formatCurrency(amountMinorUnits)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Para</span>
          <span className="font-semibold">{recipientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Saldo después</span>
          <span className="font-semibold">{formatCurrency(balanceAfter)}</span>
        </div>
      </div>

      {error ? (
        <ErrorState
          title="No se pudo completar la transferencia"
          message={error.message}
          onRetry={onConfirm}
          retryLabel="Reintentar"
        />
      ) : null}

      <Button size="lg" onClick={onConfirm} disabled={isPending}>
        {isPending ? "Confirmando…" : "Confirmar transferencia"}
      </Button>
    </Card>
  );
}
