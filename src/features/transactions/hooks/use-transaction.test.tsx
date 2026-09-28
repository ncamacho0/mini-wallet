import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/shared/lib/api-client";
import { useTransaction } from "./use-transaction";

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

describe("useTransaction", () => {
  it("returns the transaction by id", async () => {
    const response = {
      transaction: {
        id: "txn_1",
        type: "transfer_out" as const,
        status: "completed" as const,
        amountMinorUnits: 100_000,
        recipientName: "Luis Gómez",
        createdAt: "2026-09-26T10:00:00.000Z",
        reference: "MW-1",
      },
    };
    apiFetchMock.mockResolvedValue(response);

    const { result } = renderHook(() => useTransaction("txn_1"), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetchMock).toHaveBeenCalledWith("/api/transactions/txn_1");
    expect(result.current.data).toEqual(response);
  });

  it("exposes the error when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiClientError("NETWORK_ERROR", "No hubo conexión", 0));

    const { result } = renderHook(() => useTransaction("txn_1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error?.message).toBe("No hubo conexión");
  });
});
