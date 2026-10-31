import { z } from 'zod';
import { emailSchema, personaSchema } from './persona.schema';

export const profesorSchema = personaSchema.extend({
  email: emailSchema,
  cargo: z.string().trim().min(1, 'El cargo es obligatorio')
});

export const profesorIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo')
});
