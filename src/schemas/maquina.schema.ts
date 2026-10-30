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

// Parámetros de DELETE /api/maquinas/:id/actividades/:idActividad
export const maquinaActividadParamsSchema = maquinaIdSchema.extend({
  idActividad: z.coerce.number().int().positive('El idActividad debe ser un entero positivo'),
});

// Esquema para validar el body de POST /api/maquinas/:id/actividades
export const vincularActividadSchema = z.object({
  idActividad: z.coerce
    .number({
      required_error: 'El idActividad es obligatorio',
      invalid_type_error: 'El idActividad debe ser un número entero',
    })
    .int('El idActividad debe ser un número entero')
    .positive('El idActividad debe ser mayor a 0'),
});

export type CreateMaquinaInput = z.infer<typeof createMaquinaSchema>;
export type UpdateMaquinaInput = z.infer<typeof updateMaquinaSchema>;
export type VincularActividadInput = z.infer<typeof vincularActividadSchema>;