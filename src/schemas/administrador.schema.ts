import { z } from 'zod';
import { personaSchema } from './persona.schema';

export const administradorSchema = personaSchema;

export const administradorIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo')
});
