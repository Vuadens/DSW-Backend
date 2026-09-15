import { z } from 'zod';

export const planSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  tipo: z.enum(["PREMIUM", "PRO", "ESTANDAR"], {
    errorMap: () => ({ message: "El tipo solo puede ser PREMIUM, PRO o ESTANDAR" }) //hacer como un desplegable al momento de crear el front, mucho mas facil para el usuario y no se pueda equivocar al escribir el tipo de plan.
  }),
  precio: z.number().nonnegative("El precio no puede ser negativo"),
  descripcion: z.string().optional(),
  duracionMeses: z.number().int().positive().optional(),
  activo: z.boolean().optional()
});