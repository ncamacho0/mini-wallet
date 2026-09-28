import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiFetch } from "@/shared/lib/api-client";
import { useSessionStore } from "@/shared/stores/session.store";
import type { LoginResponse } from "@/shared/types";
import { LoginForm } from "./login-form";

const navigation = vi.hoisted(() => ({
  searchParams: "",
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: navigation.replace,
    refresh: navigation.refresh,
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(navigation.searchParams),
}));

vi.mock("@/shared/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/api-client")>();
  return { ...actual, apiFetch: vi.fn() };
});

const apiFetchMock = vi.mocked(apiFetch);

const session: LoginResponse = {
  user: { id: "usr_demo_1", fullName: "Noel Camacho" },
  account: {
    id: "acc_demo_1",
    userId: "usr_demo_1",
    balanceMinorUnits: 2_500_000,
    currency: "MXN",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  navigation.searchParams = "";
  useSessionStore.setState({ user: null, account: null });
});

describe("LoginForm", () => {
  it("shows the validation error and does not call the API with an invalid identifier", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Teléfono o email"), "abc");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(
      await screen.findByText("Formato inválido: usa un teléfono o email válido"),
    ).toBeInTheDocument();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("sends the identifier, stores the session and redirects to /home", async () => {
    apiFetchMock.mockResolvedValue(session);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Teléfono o email"), "noel@example.com");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/home"));
    expect(apiFetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: "noel@example.com" }),
    });
    expect(useSessionStore.getState().user?.fullName).toBe("Noel Camacho");
  });

  it("respects the redirect parameter after a successful login", async () => {
    navigation.searchParams = "redirect=%2Ftransactions%2Fnew";
    apiFetchMock.mockResolvedValue(session);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Teléfono o email"), "noel@example.com");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/transactions/new"));
  });

  it("shows the API error and does not redirect", async () => {
    apiFetchMock.mockRejectedValue(
      new ApiClientError("INVALID_CREDENTIALS", "Credenciales inválidas", 401),
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Teléfono o email"), "noel@example.com");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Credenciales inválidas");
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("shows a generic message for unexpected errors", async () => {
    apiFetchMock.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Teléfono o email"), "noel@example.com");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/error inesperado/i);
  });
});
