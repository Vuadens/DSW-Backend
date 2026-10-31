import { z } from 'zod';
import { emailSchema, personaSchema } from './persona.schema';

export const createSocioSchema = personaSchema.extend({
  email: emailSchema,
  fechaAlta: z.coerce.date().optional(),
  fechaBaja: z.coerce.date().nullable().optional(),
  planId: z.number({
    required_error: 'El planId es obligatorio',
    invalid_type_error: 'El planId debe ser un número entero',
  }).int().positive('El planId debe ser mayor a 0'),
});

export const updateSocioSchema = createSocioSchema.partial();

// Alta pública: el sistema completa la fecha de alta y el socio no puede fijar su baja.
export const registroSocioSchema = createSocioSchema.omit({ fechaAlta: true, fechaBaja: true });

export const socioIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});

export type CreateSocioInput = z.infer<typeof createSocioSchema>;
export type UpdateSocioInput = z.infer<typeof updateSocioSchema>;
