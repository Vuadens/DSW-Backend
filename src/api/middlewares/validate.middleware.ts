import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: result.error.flatten() });
  }
  req.body = result.data;
  next();
};

// valida los parámetros de la URL y detiene la petición si son inválidos.
// si cumplen el esquema, deja que el controller continúe con la petición.
export const validateParams = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({ error: 'Parámetros inválidos', details: result.error.flatten() });
  }
  next();
};

// valida los query params, osea los filtros opcionales:(?dia=lunes&idProfesor=3). Si son validos, los reemplaza
// por la version normalizada (mayusculas, numeros ya convertidos,etc) para evitar errores.
export const validateQuery = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: 'Filtros inválidos', details: result.error.flatten() });
  }
  req.query = result.data as any;
  next();
};