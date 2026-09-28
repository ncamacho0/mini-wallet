import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/shared/lib/api-client";
import { TransactionsList } from "./transactions-list";

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

describe("TransactionsList", () => {
  it("shows the transactions list", async () => {
    apiFetchMock.mockResolvedValue({
      transactions: [
        {
          id: "txn_1",
          type: "transfer_out",
          status: "completed",
          amountMinorUnits: 100_000,
          recipientName: "Luis Gómez",
          createdAt: "2026-09-26T10:00:00.000Z",
          reference: "MW-1",
        },
        {
          id: "txn_2",
          type: "transfer_in",
          status: "completed",
          amountMinorUnits: 200_000,
          recipientName: "Marta Ruiz",
          createdAt: "2026-09-25T10:00:00.000Z",
          reference: "MW-2",
        },
      ],
    });

    render(<TransactionsList />, { wrapper: createWrapper() });

    expect(await screen.findByText("Luis Gómez")).toBeInTheDocument();
    expect(screen.getByText("Marta Ruiz")).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    apiFetchMock.mockResolvedValue({ transactions: [] });

    render(<TransactionsList />, { wrapper: createWrapper() });

    expect(await screen.findByText("Aún no tienes movimientos")).toBeInTheDocument();
  });

  it("shows the error state with retry", async () => {
    apiFetchMock.mockRejectedValue(new ApiClientError("NETWORK_ERROR", "No hubo conexión", 0));

    render(<TransactionsList />, { wrapper: createWrapper() });

    expect(
      await screen.findByText("No pudimos cargar tus movimientos", undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /intentar de nuevo/i })).toBeInTheDocument();
  });
});
