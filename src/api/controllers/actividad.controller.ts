import { NextFunction, Request, Response } from 'express';
import { actividadService } from '../../services/actividad.service';

export const actividadController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const actividades = await actividadService.getAll();
      res.json(actividades);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser un número' });
    }

    try {
      const actividad = await actividadService.getById(id);
      res.json(actividad);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actividad = await actividadService.create(req.body);
      res.status(201).json(actividad);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser un número' });
    }

    try {
      const actividad = await actividadService.update(id, req.body);
      res.json(actividad);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser un número' });
    }

    try {
      await actividadService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};