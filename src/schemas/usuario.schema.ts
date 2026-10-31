import {Rol} from '@prisma/client';
import {z} from 'zod';
import {emailSchema} from './persona.schema';

// La contraseña inicial no se recibe: la asigna el sistema a partir del DNI.
export const createUsuarioSchema = z.object({
    email: emailSchema,
    usuario: z.string().min(3).optional(),
    rol: z.nativeEnum(Rol),
    personaId: z.number().int().positive(),
});

export const updateUsuarioSchema = z.object({
    email: emailSchema.optional(),
    usuario: z.string().min(3).optional(),
    password: z.string().min(8).optional(),
    rol: z.nativeEnum(Rol).optional(),
    personaId: z.number().int().positive().optional(),
    activo: z.boolean().optional(),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
