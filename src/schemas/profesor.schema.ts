import { z } from 'zod';
import { emailSchema, fechaNacSchema, personaSchema } from './persona.schema';

export const EDAD_MINIMA_PROFESOR = 18;

export const profesorSchema = personaSchema.extend({
  fechaNac: fechaNacSchema(EDAD_MINIMA_PROFESOR),
  email: emailSchema,
  cargo: z.string().trim().min(1, 'El cargo es obligatorio')
});

export const profesorIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo')
});
