import { NextFunction, Request, Response } from 'express';
import { turnoService } from '../../services/turno.service';

// Los errores se delegan al error.middleware con next(error): HttpError conserva su status
// y los errores de Prisma se traducen (P2025 -> 404, P2003 -> 409) sin exponer detalles internos.

const parsearId = (valor: string, res: Response, nombre = 'id') => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: `El ${nombre} debe ser un entero positivo` });
    return undefined;
  }
  return id;
};

export const turnoController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const turnos = await turnoService.findAll();
      return res.status(200).json(turnos);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    const id = parsearId(req.params.id, res);
    if (id === undefined) return;
    try {
      const turno = await turnoService.findById(id);
      return res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nuevoTurno = await turnoService.create(req.body);
      return res.status(201).json(nuevoTurno);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    const id = parsearId(req.params.id, res);
    if (id === undefined) return;
    try {
      const turnoActualizado = await turnoService.update(id, req.body);
      return res.status(200).json(turnoActualizado);
    } catch (error) {
      next(error);
    }
  },

  asignarProfesor: async (req: Request, res: Response, next: NextFunction) => {
    const idTurno = parsearId(req.params.id, res);
    if (idTurno === undefined) return;
    try {
      const { idProfesor } = req.body;
      const resultado = await turnoService.asignarProfesor(idTurno, idProfesor);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  },

  desasignarProfesor: async (req: Request, res: Response, next: NextFunction) => {
    const idTurno = parsearId(req.params.id, res);
    if (idTurno === undefined) return;
    const idProfesor = parsearId(req.params.idProfesor, res, 'idProfesor');
    if (idProfesor === undefined) return;
    try {
      const resultado = await turnoService.desasignarProfesor(idTurno, idProfesor);
      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  },

  obtenerProfesoresDeTurno: async (req: Request, res: Response, next: NextFunction) => {
    const idTurno = parsearId(req.params.id, res);
    if (idTurno === undefined) return;
    try {
      const data = await turnoService.obtenerProfesoresDeTurno(idTurno);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  cancelar: async (req: Request, res: Response, next: NextFunction) => {
    const id = parsearId(req.params.id, res);
    if (id === undefined) return;
    try {
      const turnoCancelado = await turnoService.cancelar(id);
      return res.status(200).json({
        mensaje: 'Turno dado de baja con éxito',
        turno: turnoCancelado,
      });
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    const id = parsearId(req.params.id, res);
    if (id === undefined) return;
    try {
      await turnoService.remove(id);
      return res.status(200).json({ mensaje: 'Turno eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  },
};
