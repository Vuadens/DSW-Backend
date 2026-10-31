import { z } from 'zod';

// Email de la cuenta de acceso: vive en Usuario, no en Persona.
export const emailSchema = z.string().trim().toLowerCase().email('Email inválido');

// Atributos comunes de Persona, que extienden Profesor, Socio y Administrador.
export const personaSchema = z.object({
  dni: z.string().trim().regex(/^\d{7,9}$/, 'El DNI debe tener entre 7 y 9 números'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
  telefono: z.string().trim().min(6, 'El teléfono debe tener al menos 6 caracteres'),
  fechaNac: z.coerce.date({
    required_error: 'La fecha de nacimiento es obligatoria',
    invalid_type_error: 'Fecha de nacimiento inválida',
  }),
});

export type PersonaInput = z.infer<typeof personaSchema>;
