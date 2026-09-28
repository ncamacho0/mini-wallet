import { z } from "zod";
import { EMAIL_PATTERN, isPhone } from "@/shared/lib/validation";

export const newContactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede superar 80 caracteres"),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || isPhone(value), "Teléfono inválido"),
    email: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || EMAIL_PATTERN.test(value), "Email inválido"),
  })
  .refine((contact) => Boolean(contact.phone) || Boolean(contact.email), {
    message: "El contacto necesita un teléfono o un email",
  });

export type NewContactRequest = z.infer<typeof newContactSchema>;
