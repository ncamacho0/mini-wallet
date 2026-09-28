import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/shared/lib/api-client";
import { HomeScreen } from "./home-screen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const useMeMock = vi.hoisted(() => vi.fn());
const useTransactionsMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/wallet/api", () => ({
  useMe: () => useMeMock(),
  useTransactions: () => useTransactionsMock(),
}));

const mockMe = {
  user: { id: "usr_1", fullName: "Noel Camacho" },
  account: { id: "acc_1", userId: "usr_1", balanceMinorUnits: 2_500_000, currency: "MXN" as const },
};

const mockTransactions = {
  data: { transactions: [] },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

describe("HomeScreen", () => {
  it("shows the skeleton while loading", () => {
    useMeMock.mockReturnValue({ isLoading: true, isError: false, error: null, data: undefined });
    useTransactionsMock.mockReturnValue(mockTransactions);

    render(<HomeScreen />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows the error state with retry", () => {
    useMeMock.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new ApiClientError("NETWORK_ERROR", "No hubo conexión", 0),
      data: undefined,
      refetch: vi.fn(),
    });
    useTransactionsMock.mockReturnValue(mockTransactions);

    render(<HomeScreen />);

    expect(screen.getByText("No pudimos cargar tu cuenta")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /intentar de nuevo/i })).toBeInTheDocument();
  });

  it("renders the balance and the transactions list", () => {
    useMeMock.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: mockMe,
      refetch: vi.fn(),
    });
    useTransactionsMock.mockReturnValue(mockTransactions);

    render(<HomeScreen />);

    expect(screen.getByText("Hola, Noel")).toBeInTheDocument();
    expect(screen.getByTestId("balance-amount")).toBeInTheDocument();
  });
});
