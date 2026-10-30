import { z } from 'zod';
import { fechaDesdeTexto } from '../utils/fechas';

// Fecha "YYYY-MM-DD" (sin hora), convertida a Date a medianoche UTC.
export const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
  .transform(fechaDesdeTexto);

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

  fechaClase: fechaSchema,
});

export const asistenciaSchema = z.object({
  asistio: z.boolean({ required_error: 'asistio es obligatorio' }),
});

// Filtros opcionales para GET /inscripciones
export const inscripcionFiltrosSchema = z.object({
  idClase: z.coerce.number().int().positive().optional(),
  idSocio: z.coerce.number().int().positive().optional(),
  fecha: fechaSchema.optional(),
  estado: z.enum(['CONFIRMADA', 'CANCELADA']).optional(),
});

export type CreateInscripcionInput = z.infer<typeof createInscripcionSchema>;
export type InscripcionFiltros = z.infer<typeof inscripcionFiltrosSchema>;
