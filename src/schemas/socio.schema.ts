import { z } from 'zod';

export const createSocioSchema = z.object({
  DNI: z.string().trim().min(7, 'El DNI debe tener al menos 7 caracteres'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  telefono: z.string().trim().min(6, 'El teléfono debe tener al menos 6 caracteres'),
  fecha_nac: z.coerce.date({
    required_error: 'La fecha de nacimiento es obligatoria',
    invalid_type_error: 'Fecha de nacimiento inválida',
  }),
  fecha_baja: z.coerce.date().nullable().optional(),
  planId: z.number({
    required_error: 'El planId es obligatorio',
    invalid_type_error: 'El planId debe ser un número entero',
  }).int().positive('El planId debe ser mayor a 0'),
});

export const updateSocioSchema = createSocioSchema.partial();

export const socioIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});

export type CreateSocioInput = z.infer<typeof createSocioSchema>;
export type UpdateSocioInput = z.infer<typeof updateSocioSchema>;