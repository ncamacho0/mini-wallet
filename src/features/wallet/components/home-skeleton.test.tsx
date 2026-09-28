import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeSkeleton } from "./home-skeleton";

describe("HomeSkeleton", () => {
  it("exposes the status role while loading", () => {
    render(<HomeSkeleton />);

    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toBeInTheDocument();
  });
});
