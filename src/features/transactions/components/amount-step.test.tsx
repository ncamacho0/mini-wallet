import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AmountStep } from "./amount-step";

const onSubmit = vi.fn();

function fillAmount(value: string) {
  const input = screen.getByLabelText("Monto");
  fireEvent.change(input, { target: { value } });
}

beforeEach(() => {
  onSubmit.mockClear();
});

describe("AmountStep", () => {
  it("sends the amount converted to cents", async () => {
    const user = userEvent.setup();
    render(<AmountStep balanceMinorUnits={2_500_000} onSubmit={onSubmit} />);

    fillAmount("1000");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onSubmit).toHaveBeenCalledWith(100_000);
  });

  it("rejects a zero amount", async () => {
    const user = userEvent.setup();
    render(<AmountStep balanceMinorUnits={2_500_000} onSubmit={onSubmit} />);

    fillAmount("0");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("El monto debe ser mayor a cero")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects an amount greater than the balance", async () => {
    const user = userEvent.setup();
    render(<AmountStep balanceMinorUnits={10_000} onSubmit={onSubmit} />);

    fillAmount("1000");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      await screen.findByText("El monto no puede superar tu saldo disponible"),
    ).toBeInTheDocument();
  });
});
