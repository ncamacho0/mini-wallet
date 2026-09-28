import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api-client";
import type { ContactsResponse } from "@/shared/types";

export function useContacts() {
  return useQuery<ContactsResponse>({
    queryKey: ["contacts"],
    queryFn: () => apiFetch<ContactsResponse>("/api/contacts"),
    staleTime: 30_000,
    retry: 1,
  });
}
