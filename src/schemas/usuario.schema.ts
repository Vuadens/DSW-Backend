import {Rol} from '@prisma/client';
import {z} from 'zod';

export const createUsuarioSchema = z.object({
    usuario: z.string().min(3),
    password: z.string().min(8),
    rol: z.nativeEnum(Rol),
    personaId: z.number().int().positive(),
});

export const updateUsuarioSchema = z.object({
    usuario: z.string().min(3).optional(),
    password: z.string().min(8).optional(),
    rol: z.nativeEnum(Rol).optional(),
    personaId: z.number().int().positive().optional(),
    activo: z.boolean().optional(),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
