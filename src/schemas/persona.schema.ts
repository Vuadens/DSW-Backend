import { z } from 'zod';

// Atributos comunes de Persona, que extienden Profesor, Socio y Administrador.
export const personaSchema = z.object({
  dni: z.string().trim().min(7, 'El DNI debe tener al menos 7 caracteres'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
  telefono: z.string().trim().min(6, 'El teléfono debe tener al menos 6 caracteres'),
  fechaNac: z.coerce.date({
    required_error: 'La fecha de nacimiento es obligatoria',
    invalid_type_error: 'Fecha de nacimiento inválida',
  }),
});

export type PersonaInput = z.infer<typeof personaSchema>;
