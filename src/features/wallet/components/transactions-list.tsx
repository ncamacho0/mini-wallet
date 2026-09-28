"use client";

import { useTransactions } from "@/features/wallet/api";
import { Card } from "@/shared/components/ui/card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { TransactionItem } from "./transaction-item";

export interface TransactionsListProps {
  limit?: number;
}

export function TransactionsList({ limit = 5 }: TransactionsListProps) {
  const { data, isLoading, isError, error, refetch } = useTransactions(limit);

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Movimientos recientes</h2>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="No pudimos cargar tus movimientos"
          message={error?.message ?? "Intenta de nuevo"}
          onRetry={() => refetch()}
        />
      ) : data?.transactions.length === 0 ? (
        <EmptyState
          title="Aún no tienes movimientos"
          description="Tus transacciones aparecerán aquí."
        />
      ) : (
        <div className="flex flex-col">
          {data?.transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </Card>
  );
}
