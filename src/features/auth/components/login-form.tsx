"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginRequest } from "@/features/auth/schemas";
import { ApiClientError, apiFetch } from "@/shared/lib/api-client";
import { sanitizeRedirect } from "@/shared/lib/redirect";
import { useSessionStore } from "@/shared/stores/session.store";
import type { LoginResponse } from "@/shared/types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const session = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(session);
      router.replace(sanitizeRedirect(searchParams.get("redirect") ?? undefined));
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? error.message
          : "Ocurrió un error inesperado. Intenta de nuevo.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="identifier" className="text-sm font-medium">
          Teléfono o email
        </label>
        <input
          id="identifier"
          type="text"
          autoComplete="username"
          inputMode="email"
          placeholder="noel@example.com"
          disabled={isSubmitting}
          aria-invalid={errors.identifier ? true : undefined}
          aria-describedby={errors.identifier ? "identifier-error" : undefined}
          className="border-border bg-card focus-visible:ring-primary rounded-lg border px-3 py-2 text-base outline-none focus-visible:ring-2"
          {...register("identifier")}
        />
        {errors.identifier ? (
          <p id="identifier-error" role="alert" className="text-danger text-sm">
            {errors.identifier.message}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger/10 text-danger rounded-lg border px-3 py-2 text-sm"
        >
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
