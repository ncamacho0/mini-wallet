import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/shared/lib/api-client";
import { SummaryStep } from "./summary-step";

const onConfirm = vi.fn();

describe("SummaryStep", () => {
  it("shows the summary and confirms", async () => {
    const user = userEvent.setup();
    render(
      <SummaryStep
        amountMinorUnits={1_000_000}
        recipientName="Luis Gómez"
        balanceMinorUnits={5_000_000}
        onConfirm={onConfirm}
        isPending={false}
        error={null}
      />,
    );

    expect(screen.getByText("Luis Gómez")).toBeInTheDocument();
    expect(screen.getByText(/monto a enviar/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar transferencia" }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it("shows the API error", () => {
    render(
      <SummaryStep
        amountMinorUnits={1_000_000}
        recipientName="Luis Gómez"
        balanceMinorUnits={5_000_000}
        onConfirm={onConfirm}
        isPending={false}
        error={new ApiClientError("INSUFFICIENT_FUNDS", "Saldo insuficiente", 422)}
      />,
    );

    expect(screen.getByText("Saldo insuficiente")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });
});
