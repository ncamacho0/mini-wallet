import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NewContactRequest } from "@/features/contacts/schemas";
import { useCreateContact } from "./use-create-contact";

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/api-client")>();
  return { ...actual, apiFetch: apiFetchMock };
});

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  apiFetchMock.mockReset();
});

describe("useCreateContact", () => {
  it("creates a contact and invalidates the list", async () => {
    const response = {
      contact: { id: "cnt_new", name: "Ana Pérez", phone: "+525598765432", isFavorite: false },
    };
    apiFetchMock.mockResolvedValue(response);

    const { result } = renderHook(() => useCreateContact(), { wrapper: createWrapper() });

    const body: NewContactRequest = { name: "Ana Pérez", phone: "+525598765432" };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetchMock).toHaveBeenCalledWith("/api/contacts", {
      method: "POST",
      body: JSON.stringify(body),
    });
    expect(result.current.data).toEqual(response);
  });
});
