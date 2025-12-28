import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  type: z.enum(["medico", "paciente"], {
    message: 'Tipo deve ser "medico" ou "paciente"',
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
