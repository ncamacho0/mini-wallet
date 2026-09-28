import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { MeResponse } from "@/shared/types";
import { BalanceCard } from "./balance-card";

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const data: MeResponse = {
  user: { id: "usr_1", fullName: "Noel Camacho" },
  account: {
    id: "acc_1",
    userId: "usr_1",
    balanceMinorUnits: 2_500_000,
    currency: "MXN",
  },
};

describe("BalanceCard", () => {
  it("shows the greeting, formatted balance and CTAs", () => {
    render(<BalanceCard data={data} />);

    expect(screen.getByText("Hola, Noel")).toBeInTheDocument();
    expect(screen.getByText(/saldo disponible/i)).toBeInTheDocument();
    expect(screen.getByTestId("balance-amount")).toHaveTextContent(/25,000/);
    expect(screen.getByRole("button", { name: "Enviar dinero" })).toBeEnabled();
  });

  it("navigates to /transactions/new when pressing send money", async () => {
    const user = userEvent.setup();
    pushMock.mockReset();

    render(<BalanceCard data={data} />);

    await user.click(screen.getByRole("button", { name: "Enviar dinero" }));

    expect(pushMock).toHaveBeenCalledWith("/transactions/new");
  });
});
