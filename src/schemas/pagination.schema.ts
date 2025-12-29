import { z } from "zod";

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "A página deve ser maior que 0" }),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "O limite deve estar entre 1 e 100",
    }),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
