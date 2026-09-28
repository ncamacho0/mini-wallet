import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/shared/lib/api-client";
import { ReceiptScreen } from "./receipt-screen";

const useTransactionMock = vi.hoisted(() => vi.fn());
vi.mock("../hooks/use-transaction", () => ({
  useTransaction: (id: string) => useTransactionMock(id),
}));

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const transaction = {
  id: "txn_1",
  type: "transfer_out" as const,
  status: "completed" as const,
  amountMinorUnits: 100_000,
  recipientName: "Luis Gómez",
  createdAt: "2026-09-26T10:00:00.000Z",
  reference: "MW-1",
};

describe("ReceiptScreen", () => {
  it("shows the receipt with the transaction data", () => {
    useTransactionMock.mockReturnValue({
      data: { transaction },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ReceiptScreen id="txn_1" />);

    expect(screen.getByText("Comprobante")).toBeInTheDocument();
    expect(screen.getByText("Luis Gómez")).toBeInTheDocument();
    expect(screen.getByText("MW-1")).toBeInTheDocument();
    expect(screen.getByText("Completada")).toBeInTheDocument();
    expect(useTransactionMock).toHaveBeenCalledWith("txn_1");
  });

  it("shows the skeleton while loading", () => {
    useTransactionMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ReceiptScreen id="txn_1" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows the error state with retry", () => {
    useTransactionMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiClientError("NETWORK_ERROR", "No hubo conexión", 0),
      refetch: vi.fn(),
    });

    render(<ReceiptScreen id="txn_1" />);

    expect(screen.getByText("No pudimos cargar el comprobante")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /intentar de nuevo/i })).toBeInTheDocument();
  });

  it("returns home when pressing the main button", async () => {
    const user = userEvent.setup();
    pushMock.mockReset();
    useTransactionMock.mockReturnValue({
      data: { transaction },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ReceiptScreen id="txn_1" />);

    await user.click(screen.getByRole("button", { name: "Volver al inicio" }));
    expect(pushMock).toHaveBeenCalledWith("/home");
  });
});
