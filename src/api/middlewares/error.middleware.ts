import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor único' });
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ error: 'No se puede completar la operación: tiene registros relacionados' });
  }

  const status = err.status || 500;
  const message = status < 500 ? err.message : 'Error interno del servidor';

  res.status(status).json({ error: message });
};