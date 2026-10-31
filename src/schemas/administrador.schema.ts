import { z } from 'zod';
import { emailSchema, personaSchema } from './persona.schema';

export const administradorSchema = personaSchema.extend({ email: emailSchema });

export type AdministradorInput = z.infer<typeof administradorSchema>;

export const administradorIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo')
});
