import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
};
