import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Transaction } from "@/shared/types";
import { TransactionItem } from "./transaction-item";

const outgoing: Transaction = {
  id: "txn_1",
  type: "transfer_out",
  status: "completed",
  amountMinorUnits: 85_000_00,
  recipientName: "Luis Gómez",
  createdAt: "2026-09-26T10:00:00.000Z",
  reference: "MW-1",
};

const incoming: Transaction = {
  id: "txn_2",
  type: "transfer_in",
  status: "completed",
  amountMinorUnits: 45_000_00,
  recipientName: "Marta Ruiz",
  createdAt: "2026-09-25T10:00:00.000Z",
  reference: "MW-2",
};

describe("TransactionItem", () => {
  it("shows a negative amount for outgoing transfers", () => {
    render(<TransactionItem transaction={outgoing} />);

    expect(screen.getByText("Luis Gómez")).toBeInTheDocument();
    expect(screen.getByText(/-/)).toBeInTheDocument();
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  it("shows a positive amount for incoming transfers", () => {
    render(<TransactionItem transaction={incoming} />);

    expect(screen.getByText(/\+/)).toBeInTheDocument();
  });
});
