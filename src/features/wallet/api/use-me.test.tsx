import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/shared/lib/api-client";
import { useMe } from "./use-me";

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/api-client")>();
  return { ...actual, apiFetch: apiFetchMock };
});

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  apiFetchMock.mockReset();
});

describe("useMe", () => {
  it("returns the user and the account", async () => {
    apiFetchMock.mockResolvedValue({
      user: { id: "usr_1", fullName: "Noel Camacho" },
      account: { id: "acc_1", userId: "usr_1", balanceMinorUnits: 2_500_000, currency: "MXN" },
    });

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.user.fullName).toBe("Noel Camacho");
    expect(result.current.data?.account.balanceMinorUnits).toBe(2_500_000);
  });

  it("exposes the error when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiClientError("NETWORK_ERROR", "No hubo conexión", 0));

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });
    expect(result.current.error?.message).toBe("No hubo conexión");
  });
});
