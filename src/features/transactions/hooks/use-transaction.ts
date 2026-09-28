import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api-client";
import type { CreateTransactionResponse } from "@/shared/types";

export function useTransaction(id: string) {
  return useQuery<CreateTransactionResponse>({
    queryKey: ["transaction", id],
    queryFn: () => apiFetch<CreateTransactionResponse>(`/api/transactions/${id}`),
    staleTime: 60_000,
    retry: 1,
  });
}
