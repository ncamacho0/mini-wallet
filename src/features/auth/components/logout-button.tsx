"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/shared/lib/api-client";
import { useSessionStore } from "@/shared/stores/session.store";

export function LogoutButton() {
  const router = useRouter();
  const clear = useSessionStore((state) => state.clear);
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    try {
      await apiFetch<void>("/api/auth/logout", { method: "POST" });
    } catch {
      setIsPending(false);
    } finally {
      clear();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="border-border hover:bg-muted rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60"
    >
      {isPending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
