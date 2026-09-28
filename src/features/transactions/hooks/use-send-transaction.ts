import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiClientError } from "@/shared/lib/api-client";
import type { CreateTransactionRequest } from "@/features/transactions/schemas";
import type { CreateTransactionResponse } from "@/shared/types";

export function useSendTransaction() {
  const queryClient = useQueryClient();

  return useMutation<CreateTransactionResponse, ApiClientError, CreateTransactionRequest>({
    mutationFn: (body) =>
      apiFetch<CreateTransactionResponse>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
