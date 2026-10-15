import { z } from 'zod';

export const DIAS_SEMANA = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO'
] as const;

// Acepta "lunes", "Lunes", " LUNES " y lo normaliza a mayusculas.
const diaSemanaSchema = z.preprocess(
  (valor) => (typeof valor === 'string' ? valor.trim().toUpperCase() : valor),
  z.enum(DIAS_SEMANA, { errorMap: () => ({ message: `El día debe ser uno de: ${DIAS_SEMANA.join(', ')}` }) })
);

// Formato 24 hs, "HH:mm" (ej: "07:30", "18:00")
const horaSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:mm (ej: 18:00)');

export const claseSchema = z.object({
  diaSemana: diaSemanaSchema,
  horaDesde: horaSchema,
  horaHasta: horaSchema,
  cupo: z.number().int('El cupo debe ser un entero').positive('El cupo debe ser mayor a 0'),
  idActividad: z.number().int().positive('idActividad debe ser un entero positivo'),
  idProfesor: z.number().int().positive('idProfesor debe ser un entero positivo')
});

export const claseIdSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo')
});

// Filtros opcionales para GET /clases
export const claseFiltrosSchema = z.object({
  dia: diaSemanaSchema.optional(),
  idProfesor: z.coerce.number().int().positive().optional(),
  idActividad: z.coerce.number().int().positive().optional()
});

export type ClaseInput = z.infer<typeof claseSchema>;
export type ClaseFiltros = z.infer<typeof claseFiltrosSchema>;
