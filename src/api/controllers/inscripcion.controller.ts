import { NextFunction, Request, Response } from 'express';
import { inscripcionService } from '../../services/inscripcion.service';

// Los errores se delegan al error.middleware con next(error): las reglas de negocio
// llegan como HttpError con su status, y cualquier otro error se responde como 500
// sin exponer el mensaje interno (por ejemplo, detalles de Prisma).

const parsearId = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un entero positivo' });
    return undefined;
  }
  return id;
};

export const inscripcionController = {

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inscripciones = await inscripcionService.findAll(req.user!);
      return res.status(200).json(inscripciones);
    } catch (error) {
      next(error);
    }
  },


  getById: async (req: Request, res: Response, next: NextFunction) => {
    const id = parsearId(req, res);
    if (id === undefined) return;
    try {
      const inscripcion = await inscripcionService.findById(id, req.user);
      return res.status(200).json(inscripcion);
    } catch (error) {
      next(error);
    }
  },


  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.body ya viene validado y transformado por el middleware de Zod
      const nuevaInscripcion = await inscripcionService.create(req.body, req.user!);
      return res.status(201).json(nuevaInscripcion);
    } catch (error) {
      next(error);
    }
  },

  // Baja lógica
  cancelar: async (req: Request, res: Response, next: NextFunction) => {
    const id = parsearId(req, res);
    if (id === undefined) return;
    try {
      const inscripcionCancelada = await inscripcionService.cancelar(id, req.user!);
      return res.status(200).json({
        mensaje: 'Inscripción cancelada con éxito',
        inscripcion: inscripcionCancelada,
      });
    } catch (error) {
      next(error);
    }
  },

  // Baja fisica
  remove: async (req: Request, res: Response, next: NextFunction) => {
    const id = parsearId(req, res);
    if (id === undefined) return;
    try {
      await inscripcionService.remove(id, req.user!);
      return res.status(200).json({ mensaje: 'Inscripción eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  },
};
