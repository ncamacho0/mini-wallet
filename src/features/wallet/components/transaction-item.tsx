import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/classnames";
import { formatDate, formatSignedCurrency } from "@/shared/lib/format";
import type { Transaction } from "@/shared/types";

export interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isOut = transaction.type === "transfer_out";
  const statusVariant =
    transaction.status === "completed"
      ? "success"
      : transaction.status === "failed"
        ? "danger"
        : "warning";

  return (
    <div className="border-border flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium">{transaction.recipientName}</span>
        <span className="text-muted-foreground text-xs">{formatDate(transaction.createdAt)}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className={cn("font-semibold", isOut ? "text-danger" : "text-success")}>
          {formatSignedCurrency(transaction.amountMinorUnits, transaction.type)}
        </span>
        <Badge variant={statusVariant}>
          {transaction.status === "completed"
            ? "Completada"
            : transaction.status === "failed"
              ? "Fallida"
              : "Pendiente"}
        </Badge>
      </div>
    </div>
  );
}
