import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as contactsApi from "@/features/contacts/api";
import type { Contact } from "@/shared/types";
import { RecipientStep } from "./recipient-step";

const useContactsMock = vi.fn();
const useCreateContactMock = vi.fn();

vi.mock("@/features/contacts/api", async (importOriginal) => {
  const actual = await importOriginal<typeof contactsApi>();
  return {
    ...actual,
    useContacts: () => useContactsMock(),
    useCreateContact: () => useCreateContactMock(),
  };
});

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const contacts: Contact[] = [
  { id: "cnt_1", name: "Luis Gómez", phone: "+525576543210", isFavorite: true },
  { id: "cnt_2", name: "Marta Ruiz", email: "marta@example.com", isFavorite: false },
];

beforeEach(() => {
  useContactsMock.mockReturnValue({
    data: { contacts },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
  useCreateContactMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
});

describe("RecipientStep", () => {
  it("allows selecting an existing contact", async () => {
    const user = userEvent.setup();
    const onSelectExisting = vi.fn();
    const onCreateNew = vi.fn();

    render(<RecipientStep onSelectExisting={onSelectExisting} onCreateNew={onCreateNew} />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByText("Luis Gómez"));

    expect(onSelectExisting).toHaveBeenCalledWith("cnt_1", "Luis Gómez");
  });

  it("creates a new contact and selects it", async () => {
    const user = userEvent.setup();
    const onSelectExisting = vi.fn();
    const onCreateNew = vi.fn();
    const mutate = vi.fn((_values, options) => {
      options?.onSuccess?.({ contact: { id: "cnt_new", name: "Ana Pérez" } });
    });
    useCreateContactMock.mockReturnValue({ mutate, isPending: false });

    render(<RecipientStep onSelectExisting={onSelectExisting} onCreateNew={onCreateNew} />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByRole("button", { name: "Nuevo contacto" }));
    await user.type(screen.getByLabelText("Nombre"), "Ana Pérez");
    await user.type(screen.getByLabelText("Teléfono"), "+525598765432");
    await user.click(screen.getByRole("button", { name: "Guardar y continuar" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ana Pérez", phone: "+525598765432" }),
      expect.any(Object),
    );
    expect(onCreateNew).toHaveBeenCalledWith({ id: "cnt_new", name: "Ana Pérez" });
  });
});
