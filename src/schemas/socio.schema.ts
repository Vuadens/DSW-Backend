import { z } from 'zod';

export const createSocioSchema = z.object({
  DNI: z.string().trim().min(7, 'El DNI debe tener al menos 7 caracteres'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().trim().email('Formato de email inválido'),
  telefono: z.string().trim().min(6, 'El teléfono debe tener al menos 6 caracteres'),
  direccion: z.string().trim().min(1, 'La dirección es obligatoria'),
  fecha_nac: z.coerce.date({
    required_error: 'La fecha de nacimiento es obligatoria',
    invalid_type_error: 'Fecha de nacimiento inválida',
  }),
  fecha_baja: z.coerce.date().nullable().optional(),
});

export const updateSocioSchema = createSocioSchema.partial();

export const socioIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});

export type CreateSocioInput = z.infer<typeof createSocioSchema>;
export type UpdateSocioInput = z.infer<typeof updateSocioSchema>;