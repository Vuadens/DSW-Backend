import { z } from 'zod';

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createTurnoSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    diaSemana: z.enum(
      ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
      {
        errorMap: () => ({ message: 'Día de la semana inválido' }),
      }
    ),
    horaDesde: z.string().regex(horaRegex, 'El formato de horaDesde debe ser HH:mm'),
    horaHasta: z.string().regex(horaRegex, 'El formato de horaHasta debe ser HH:mm'),
    activo: z.boolean().optional().default(true),
  })
  .refine((data) => data.horaHasta > data.horaDesde, {
    message: 'horaHasta debe ser estrictamente posterior a horaDesde',
    path: ['horaHasta'],
  });

export const updateTurnoSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    diaSemana: z
      .enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'])
      .optional(),
    horaDesde: z.string().regex(horaRegex, 'El formato de horaDesde debe ser HH:mm').optional(),
    horaHasta: z.string().regex(horaRegex, 'El formato de horaHasta debe ser HH:mm').optional(),
    activo: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.horaDesde && data.horaHasta) {
        return data.horaHasta > data.horaDesde;
      }
      return true;
    },
    {
      message: 'horaHasta debe ser estrictamente posterior a horaDesde',
      path: ['horaHasta'],
    }
  );

export const asignarProfesorSchema = z.object({
  idProfesor: z.coerce
    .number({
      required_error: 'El idProfesor es obligatorio',
      invalid_type_error: 'El idProfesor debe ser un número entero',
    })
    .int('El idProfesor debe ser un número entero')
    .positive('El idProfesor debe ser mayor a 0'),
});

export type CreateTurnoInput = z.infer<typeof createTurnoSchema>;
export type UpdateTurnoInput = z.infer<typeof updateTurnoSchema>;
export type AsignarProfesorInput = z.infer<typeof asignarProfesorSchema>;