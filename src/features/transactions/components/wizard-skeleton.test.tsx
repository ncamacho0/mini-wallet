import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WizardSkeleton } from "./wizard-skeleton";

describe("WizardSkeleton", () => {
  it("exposes the status role while loading", () => {
    render(<WizardSkeleton />);

    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toBeInTheDocument();
  });
});
