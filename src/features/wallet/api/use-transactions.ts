import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api-client";
import type { TransactionsResponse } from "@/shared/types";

export function useTransactions(limit = 20) {
  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", limit],
    queryFn: () => apiFetch<TransactionsResponse>(`/api/transactions?limit=${limit}`),
    staleTime: 30_000,
    retry: 1,
  });
}
