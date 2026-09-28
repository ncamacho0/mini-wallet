"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/format";
import type { MeResponse } from "@/shared/types";

export interface BalanceCardProps {
  data: MeResponse;
}

export function BalanceCard({ data }: BalanceCardProps) {
  const router = useRouter();
  const firstName = data.user.fullName.split(" ")[0];

  return (
    <Card className="flex flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-sm">Hola, {firstName}</p>
        <p className="text-muted-foreground text-sm">Saldo disponible</p>
        <p className="mt-1 text-4xl font-bold tracking-tight" data-testid="balance-amount">
          {formatCurrency(data.account.balanceMinorUnits)}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => router.push("/transactions/new")}>
          Enviar dinero
        </Button>
        <Button size="lg" variant="secondary" disabled>
          Recargar
        </Button>
        <Button size="lg" variant="secondary" disabled>
          Recibir
        </Button>
      </div>
    </Card>
  );
}
