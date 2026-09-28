"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/format";

export interface AmountStepProps {
  balanceMinorUnits: number;
  defaultValue?: number;
  onSubmit: (amountMinorUnits: number) => void;
}

export function AmountStep({ balanceMinorUnits, defaultValue, onSubmit }: AmountStepProps) {
  const schema = useMemo(
    () =>
      z.object({
        amountPesos: z.coerce
          .number({ message: "Ingresa un monto válido" })
          .positive("El monto debe ser mayor a cero")
          .max(balanceMinorUnits / 100, "El monto no puede superar tu saldo disponible"),
      }),
    [balanceMinorUnits],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { amountPesos: defaultValue ? defaultValue / 100 : undefined },
  });

  return (
    <Card>
      <h2 className="mb-1 text-xl font-semibold">¿Cuánto quieres enviar?</h2>
      <p className="text-muted-foreground mb-4 text-sm">
        Saldo disponible: {formatCurrency(balanceMinorUnits)}
      </p>

      <form
        onSubmit={handleSubmit((values) => onSubmit(values.amountPesos * 100))}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="amount" className="text-sm font-medium">
            Monto
          </label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              $
            </span>
            <input
              id="amount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              aria-invalid={errors.amountPesos ? true : undefined}
              aria-describedby={errors.amountPesos ? "amount-error" : undefined}
              className="border-border bg-card focus-visible:ring-primary w-full rounded-lg border py-2 pr-3 pl-7 text-lg outline-none focus-visible:ring-2"
              {...register("amountPesos")}
            />
          </div>
          {errors.amountPesos ? (
            <p id="amount-error" role="alert" className="text-danger text-sm">
              {errors.amountPesos.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg">
          Continuar
        </Button>
      </form>
    </Card>
  );
}
