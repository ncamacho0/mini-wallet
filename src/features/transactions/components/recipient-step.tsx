"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useContacts, useCreateContact } from "@/features/contacts";
import { newContactSchema, type NewContactRequest } from "@/features/contacts/schemas";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/classnames";
import type { Contact } from "@/shared/types";

export interface RecipientStepProps {
  onSelectExisting: (recipientId: string, name: string) => void;
  onCreateNew: (contact: Contact) => void;
}

export function RecipientStep({ onSelectExisting, onCreateNew }: RecipientStepProps) {
  const { data, isLoading, isError, error, refetch } = useContacts();
  const createContact = useCreateContact();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewContactRequest>({
    resolver: zodResolver(newContactSchema),
    defaultValues: { name: "", phone: "", email: "" },
  });

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="mb-2 h-6 w-40" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar tus contactos"
        message={error?.message ?? "Intenta de nuevo"}
        onRetry={() => refetch()}
      />
    );
  }

  const contacts = data?.contacts ?? [];

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Selecciona un destinatario</h2>

      <div className="flex flex-col gap-2">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            type="button"
            onClick={() => onSelectExisting(contact.id, contact.name)}
            aria-label={`Enviar dinero a ${contact.name}`}
            className={cn(
              "border-border hover:bg-muted flex items-center justify-between rounded-lg border p-3 text-left transition-colors",
            )}
          >
            <div>
              <p className="font-medium">{contact.name}</p>
              <p className="text-muted-foreground text-sm">{contact.phone ?? contact.email}</p>
            </div>
            {contact.isFavorite ? (
              <span className="bg-warning/15 text-warning rounded-full px-2 py-0.5 text-xs font-medium">
                Favorito
              </span>
            ) : null}
          </button>
        ))}

        {contacts.length === 0 ? (
          <EmptyState
            title="No tienes contactos guardados"
            description="Agrega uno nuevo para continuar."
          />
        ) : null}
      </div>

      {!showForm ? (
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setShowForm(true)}>
          Nuevo contacto
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit((values) =>
            createContact.mutate(values, {
              onSuccess: ({ contact }) => {
                onCreateNew(contact);
              },
            }),
          )}
          className="border-border mt-4 flex flex-col gap-3 rounded-lg border p-3"
        >
          <p className="font-medium">Nuevo contacto</p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              autoFocus
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="border-border bg-card focus-visible:ring-primary rounded-lg border px-3 py-2 outline-none focus-visible:ring-2"
              {...register("name")}
            />
            {errors.name ? (
              <p id="name-error" role="alert" className="text-danger text-sm">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className="border-border bg-card focus-visible:ring-primary rounded-lg border px-3 py-2 outline-none focus-visible:ring-2"
              {...register("phone")}
            />
            {errors.phone ? (
              <p id="phone-error" role="alert" className="text-danger text-sm">
                {errors.phone.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="border-border bg-card focus-visible:ring-primary rounded-lg border px-3 py-2 outline-none focus-visible:ring-2"
              {...register("email")}
            />
            {errors.email ? (
              <p id="email-error" role="alert" className="text-danger text-sm">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          {errors.root ? (
            <p id="root-error" role="alert" className="text-danger text-sm">
              {errors.root.message}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={createContact.isPending} className="flex-1">
              {createContact.isPending ? "Guardando…" : "Guardar y continuar"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
