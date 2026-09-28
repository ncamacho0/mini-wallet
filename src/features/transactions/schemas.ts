import { z } from "zod";
import { newContactSchema } from "@/features/contacts";

export const amountMinorUnitsSchema = z
  .number()
  .int("El monto debe expresarse en centavos (entero)")
  .positive("El monto debe ser mayor a cero");

export const createTransactionSchema = z.union([
  z.object({
    amountMinorUnits: amountMinorUnitsSchema,
    recipientId: z.string().min(1),
  }),
  z.object({
    amountMinorUnits: amountMinorUnitsSchema,
    newRecipient: newContactSchema,
  }),
]);

export const listTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionSchema>;
