import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/shared/lib/api-client";
import { useContacts } from "./use-contacts";

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/api-client")>();
  return { ...actual, apiFetch: apiFetchMock };
});

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  apiFetchMock.mockReset();
});

describe("useContacts", () => {
  it("returns the contacts list", async () => {
    const response = {
      contacts: [
        { id: "cnt_1", name: "Luis Gómez", phone: "+525576543210", isFavorite: true },
        { id: "cnt_2", name: "Marta Ruiz", email: "marta@example.com", isFavorite: false },
      ],
    };
    apiFetchMock.mockResolvedValue(response);

    const { result } = renderHook(() => useContacts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetchMock).toHaveBeenCalledWith("/api/contacts");
    expect(result.current.data).toEqual(response);
  });

  it("exposes the error when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiClientError("NETWORK_ERROR", "No hubo conexión", 0));

    const { result } = renderHook(() => useContacts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error?.message).toBe("No hubo conexión");
  });
});
