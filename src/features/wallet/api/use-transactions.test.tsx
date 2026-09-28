import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Transaction } from "@/shared/types";
import { useTransactions } from "./use-transactions";

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

describe("useTransactions", () => {
  it("returns transactions sorted", async () => {
    const transactions: Transaction[] = [
      {
        id: "txn_1",
        type: "transfer_out",
        status: "completed",
        amountMinorUnits: 100_000,
        recipientName: "Luis",
        createdAt: "2026-09-26T10:00:00.000Z",
        reference: "MW-1",
      },
      {
        id: "txn_2",
        type: "transfer_in",
        status: "completed",
        amountMinorUnits: 200_000,
        recipientName: "Marta",
        createdAt: "2026-09-25T10:00:00.000Z",
        reference: "MW-2",
      },
    ];
    apiFetchMock.mockResolvedValue({ transactions });

    const { result } = renderHook(() => useTransactions(5), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.transactions).toHaveLength(2);
    expect(apiFetchMock).toHaveBeenCalledWith("/api/transactions?limit=5");
  });

  it("respects the default limit", async () => {
    apiFetchMock.mockResolvedValue({ transactions: [] });

    renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalledWith("/api/transactions?limit=20"));
  });
});
