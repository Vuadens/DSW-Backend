import { Request, Response, NextFunction } from 'express';
import { actividadService } from '../../services/actividad.service';

export const actividadController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await actividadService.getAll()); } catch (err) { next(err); }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await actividadService.getById(Number(req.params.id))); } catch (err) { next(err); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await actividadService.create(req.body)); } catch (err) { next(err); }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await actividadService.update(Number(req.params.id), req.body)); } catch (err) { next(err); }
  },
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try { await actividadService.remove(Number(req.params.id)); res.status(204).send(); } catch (err) { next(err); }
  },
};