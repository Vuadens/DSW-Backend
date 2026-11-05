import { z } from 'zod';
import { cumpleEdad, hoy } from '../utils/fechas';

// Email de la cuenta de acceso: vive en Usuario, no en Persona.
export const emailSchema = z.string().trim().toLowerCase().email('Email inválido');

const ANIO_MINIMO = 1900;

// Fecha de nacimiento con año de 4 cifras, que no sea futura y, si se indica, con edad mínima.
export const fechaNacSchema = (edadMinima?: number) =>
  z.coerce
    .date({
      required_error: 'La fecha de nacimiento es obligatoria',
      invalid_type_error: 'Fecha de nacimiento inválida',
    })
    .refine((fecha) => fecha.getUTCFullYear() >= ANIO_MINIMO, 'Fecha de nacimiento inválida')
    .refine((fecha) => fecha.getTime() <= hoy().getTime(), 'La fecha de nacimiento no puede ser futura')
    .refine(
      (fecha) => edadMinima === undefined || cumpleEdad(fecha, edadMinima),
      `Debe tener al menos ${edadMinima} años`
    );

// Atributos comunes de Persona, que extienden Profesor, Socio y Administrador.
export const personaSchema = z.object({
  dni: z.string().trim().regex(/^\d{7,9}$/, 'El DNI debe tener entre 7 y 9 números'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio'),
  telefono: z.string().trim().min(6, 'El teléfono debe tener al menos 6 caracteres'),
  fechaNac: fechaNacSchema(),
});

export type PersonaInput = z.infer<typeof personaSchema>;
