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
