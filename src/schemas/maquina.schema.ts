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

// Esquema para validar el body de POST /api/maquinas/:id/clases
export const vincularClaseSchema = z.object({
  idClase: z.coerce
    .number({
      required_error: 'El idClase es obligatorio',
      invalid_type_error: 'El idClase debe ser un número entero',
    })
    .int('El idClase debe ser un número entero')
    .positive('El idClase debe ser mayor a 0'),
});

export type CreateMaquinaInput = z.infer<typeof createMaquinaSchema>;
export type UpdateMaquinaInput = z.infer<typeof updateMaquinaSchema>;
export type VincularClaseInput = z.infer<typeof vincularClaseSchema>;