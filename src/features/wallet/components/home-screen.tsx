"use client";

import { useMe } from "@/features/wallet/api";
import { ErrorState } from "@/shared/components/ui/error-state";
import { BalanceCard } from "./balance-card";
import { HomeSkeleton } from "./home-skeleton";
import { TransactionsList } from "./transactions-list";

export function HomeScreen() {
  const { data, isLoading, isError, error, refetch } = useMe();

  if (isLoading) return <HomeSkeleton />;
  if (isError)
    return (
      <ErrorState
        title="No pudimos cargar tu cuenta"
        message={error?.message ?? "Intenta de nuevo"}
        onRetry={() => refetch()}
      />
    );
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <BalanceCard data={data} />
      <TransactionsList />
    </div>
  );
}
