import { z } from "zod";
import { isEmailOrPhone } from "@/shared/lib/validation";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Ingresa tu teléfono o email").refine(isEmailOrPhone, {
    message: "Formato inválido: usa un teléfono o email válido",
  }),
});

export type LoginRequest = z.infer<typeof loginSchema>;
