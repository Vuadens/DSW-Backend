import { z } from 'zod';

export const createActividadSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  cupoMaximo: z.number().int().positive(),
});

export const updateActividadSchema = createActividadSchema.partial();

export type CreateActividadInput = z.infer<typeof createActividadSchema>;
export type UpdateActividadInput = z.infer<typeof updateActividadSchema>;
