import { z } from 'zod';

export const createInscripcionSchema = z.object({
  idSocio: z.coerce
    .number({
      required_error: 'El idSocio es obligatorio',
      invalid_type_error: 'El idSocio debe ser un número entero',
    })
    .int('El idSocio debe ser un número entero')
    .positive('El idSocio debe ser mayor a 0'),

  idClase: z.coerce
    .number({
      required_error: 'El idClase es obligatorio',
      invalid_type_error: 'El idClase debe ser un número entero',
    })
    .int('El idClase debe ser un número entero')
    .positive('El idClase debe ser mayor a 0'),

  activo: z.boolean().optional().default(true),
});

export type CreateInscripcionInput = z.infer<typeof createInscripcionSchema>;