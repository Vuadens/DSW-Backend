import { z } from 'zod';

export const createActividadSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  cupoMaximo: z.number().int().positive(),
});

export type CreateActividadInput = z.infer<typeof createActividadSchema>;