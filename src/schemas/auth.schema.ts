import {z} from 'zod';

export const loginSchema = z.object({
    // Email o DNI de la persona.
    identificador: z.string().trim().min(1),
    password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
