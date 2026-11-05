import { z } from 'zod';

export const createActividadSchema = z.object({
  nombre: z.string().min(1),
  // Vacía o null borra la descripción.
  descripcion: z.string().trim().nullable().optional().transform((v) => (v === '' ? null : v)),
  cupoMaximo: z.number().int().positive(),
  // ids de los planes que incluyen la actividad (reemplaza las asociaciones actuales)
  planes: z.array(z.number().int().positive()).optional(),
});

export const updateActividadSchema = createActividadSchema.partial();

export type CreateActividadInput = z.infer<typeof createActividadSchema>;
export type UpdateActividadInput = z.infer<typeof updateActividadSchema>;
