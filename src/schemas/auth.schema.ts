import {z} from 'zod';

export const loginSchema = z.object({
    // Email o DNI de la persona.
    identificador: z.string().trim().min(1),
    password: z.string().min(1),
});

export const cambiarPasswordSchema = z.object({
    passwordActual: z.string().min(1),
    passwordNueva: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;
