import { NextFunction, Request, Response } from 'express';
import { cuotaService } from '../../services/cuota.service';

export const cuotaController = {
  registrarCobro: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cuota = await cuotaService.registrarCobro(req.body);
      res.status(201).json(cuota);
    } catch (err) {
      next(err);
    }
  },
};
