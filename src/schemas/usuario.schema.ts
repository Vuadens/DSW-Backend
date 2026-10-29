import {Rol} from '@prisma/client';
import {z} from 'zod';

export const createUsuarioSchema = z.object({
    usuario: z.string().min(3),
    password: z.string().min(8),
    rol: z.nativeEnum(Rol),
    socioId: z.number().int().positive().optional(),
    profesorId: z.number().int().positive().optional(),
}).superRefine((data, ctx) => {
    if (data.rol === Rol.SOCIO && data.socioId === undefined) {
        ctx.addIssue({code: z.ZodIssueCode.custom, path: ['socioId'], message: 'socioId es obligatorio para SOCIO'});
    }
    if (data.rol === Rol.PROFESOR && data.profesorId === undefined) {
        ctx.addIssue({code: z.ZodIssueCode.custom, path: ['profesorId'], message: 'profesorId es obligatorio para PROFESOR'});
    }
});

export const updateUsuarioSchema = z.object({
    usuario: z.string().min(3).optional(),
    password: z.string().min(8).optional(),
    rol: z.nativeEnum(Rol).optional(),
    socioId: z.number().int().positive().optional(),
    profesorId: z.number().int().positive().optional(),
    activo: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (data.rol === Rol.SOCIO && data.socioId === undefined) {
        ctx.addIssue({code: z.ZodIssueCode.custom, path: ['socioId'], message: 'socioId es obligatorio para SOCIO'});
    }
    if (data.rol === Rol.PROFESOR && data.profesorId === undefined) {
        ctx.addIssue({code: z.ZodIssueCode.custom, path: ['profesorId'], message: 'profesorId es obligatorio para PROFESOR'});
    }
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
