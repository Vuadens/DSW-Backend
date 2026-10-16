import { z } from 'zod';

export const createMaquinaSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  tipo: z
    .string({ required_error: 'El tipo es obligatorio' })
    .trim()
    .min(1, 'El tipo es obligatorio'),
  descripcion: z.string().trim().optional(),
  estado: z
    .enum(['DISPONIBLE', 'REPARACION', 'INHABILITADA'], {
      errorMap: () => ({ message: 'El estado debe ser DISPONIBLE, REPARACION o INHABILITADA' }),
    })
    .optional()
    .default('DISPONIBLE'),
});

export const updateMaquinaSchema = createMaquinaSchema.partial();

export const maquinaIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});

export type CreateMaquinaInput = z.infer<typeof createMaquinaSchema>;
export type UpdateMaquinaInput = z.infer<typeof updateMaquinaSchema>;