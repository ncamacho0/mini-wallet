import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api-client";
import type { NewContactRequest } from "@/features/contacts/schemas";
import type { CreateContactResponse } from "@/shared/types";

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation<CreateContactResponse, Error, NewContactRequest>({
    mutationFn: (body) =>
      apiFetch<CreateContactResponse>("/api/contacts", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
