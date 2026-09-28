import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Contact } from "@/shared/types";
import { useTxDraftStore } from "@/shared/stores/tx-draft.store";
import { TransactionWizard } from "./transaction-wizard";

const useMeMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/wallet", () => ({
  useMe: () => useMeMock(),
}));

const useContactsMock = vi.hoisted(() => vi.fn());
const useCreateContactMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/contacts", () => ({
  useContacts: () => useContactsMock(),
  useCreateContact: () => useCreateContactMock(),
}));

const sendMutateMock = vi.hoisted(() => vi.fn());
vi.mock("../hooks/use-send-transaction", () => ({
  useSendTransaction: () => ({
    mutate: sendMutateMock,
    isPending: false,
    error: null,
  }),
}));

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

const contacts: Contact[] = [
  { id: "cnt_1", name: "Luis Gómez", phone: "+525576543210", isFavorite: true },
];

const me = {
  user: { id: "usr_1", fullName: "Noel Camacho" },
  account: {
    id: "acc_1",
    userId: "usr_1",
    balanceMinorUnits: 2_500_000,
    currency: "MXN" as const,
  },
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("TransactionWizard", () => {
  beforeEach(() => {
    useTxDraftStore.setState({ amountMinorUnits: null, recipient: null, step: "amount" });
    useMeMock.mockReturnValue({
      data: me,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    useContactsMock.mockReturnValue({
      data: { contacts },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    useCreateContactMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    sendMutateMock.mockReset();
    pushMock.mockReset();
  });

  afterEach(() => {
    useTxDraftStore.getState().reset();
  });

  it("shows the skeleton while the account loads", () => {
    useMeMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TransactionWizard />, { wrapper: createWrapper() });

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows an error when the account load fails", () => {
    useMeMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: "No hubo conexión" },
      refetch: vi.fn(),
    });

    render(<TransactionWizard />, { wrapper: createWrapper() });

    expect(screen.getByText("No pudimos cargar tu cuenta")).toBeInTheDocument();
  });

  it("advances from amount to recipient and shows the summary", async () => {
    const user = userEvent.setup();
    render(<TransactionWizard />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText("Monto"), "1000");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("Selecciona un destinatario")).toBeInTheDocument();

    await user.click(screen.getByText("Luis Gómez"));

    expect(screen.getByText("Resumen de la transferencia")).toBeInTheDocument();
  });

  it("goes back to the previous step with the Volver button", async () => {
    const user = userEvent.setup();
    useTxDraftStore.setState({
      amountMinorUnits: 100_000,
      recipient: { recipientId: "cnt_1", name: "Luis Gómez" },
      step: "summary",
    });

    render(<TransactionWizard />, { wrapper: createWrapper() });

    expect(screen.getByText("Resumen de la transferencia")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Volver" }));

    expect(screen.getByText("Selecciona un destinatario")).toBeInTheDocument();
  });
});
