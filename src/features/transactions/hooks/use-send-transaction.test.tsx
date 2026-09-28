import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateTransactionRequest } from "@/features/transactions/schemas";
import type { CreateTransactionResponse } from "@/shared/types";
import { useSendTransaction } from "./use-send-transaction";

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

describe("useSendTransaction", () => {
  it("sends the body and returns the created transaction", async () => {
    const response: CreateTransactionResponse = {
      transaction: {
        id: "txn_1",
        type: "transfer_out",
        status: "completed",
        amountMinorUnits: 1_000_000,
        recipientName: "Luis Gómez",
        createdAt: "2026-09-26T10:00:00.000Z",
        reference: "MW-1",
      },
    };
    apiFetchMock.mockResolvedValue(response);

    const { result } = renderHook(() => useSendTransaction(), { wrapper: createWrapper() });

    const body: CreateTransactionRequest = { amountMinorUnits: 1_000_000, recipientId: "cnt_1" };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiFetchMock).toHaveBeenCalledWith("/api/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    });
    expect(result.current.data).toEqual(response);
  });
});
