import { z } from 'zod';

export const registrarCobroSchema = z.object({
  socioId: z.number().int().positive(),
  mes: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mes inválido. Formato esperado: AAAA-MM').optional(),
});

export type RegistrarCobroInput = z.infer<typeof registrarCobroSchema>;
