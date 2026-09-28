import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogoutButton } from "./logout-button";

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/api-client")>();
  return { ...actual, apiFetch: apiFetchMock };
});

const clearMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/stores/session.store", () => ({
  useSessionStore: (selector: (state: { clear: typeof clearMock }) => unknown) =>
    selector({ clear: clearMock }),
}));

const replaceMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

beforeEach(() => {
  apiFetchMock.mockReset();
  clearMock.mockReset();
  replaceMock.mockReset();
  refreshMock.mockReset();
});

describe("LogoutButton", () => {
  it("logs out and redirects to login", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue(undefined);

    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(clearMock).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith("/login");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("clears the session even if logout fails", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValue(new Error("network"));

    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    await vi.waitFor(() => {
      expect(clearMock).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });
});
