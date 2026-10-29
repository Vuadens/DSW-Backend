import { z } from 'zod';

export const profesorSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
  cargo: z.string().trim().min(1, 'El cargo es obligatorio')
});

export const profesorIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo')
});
