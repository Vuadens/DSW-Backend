import { Request, Response } from 'express';
import { turnoService } from '../../services/turno.service';

export const turnoController = {
  getAll: async (_req: Request, res: Response) => {
    const turnos = await turnoService.findAll();
    return res.status(200).json(turnos);
  },

  getById: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const turno = await turnoService.findById(id);
    return res.status(200).json(turno);
  },

  create: async (req: Request, res: Response) => {
    const nuevoTurno = await turnoService.create(req.body);
    return res.status(201).json(nuevoTurno);
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const turnoActualizado = await turnoService.update(id, req.body);
    return res.status(200).json(turnoActualizado);
  },

  asignarProfesor: async (req: Request, res: Response) => {
    const idTurno = Number(req.params.id);
    const { idProfesor } = req.body;
    const resultado = await turnoService.asignarProfesor(idTurno, idProfesor);
    return res.status(200).json(resultado);
  },

  desasignarProfesor: async (req: Request, res: Response) => {
    const idTurno = Number(req.params.id);
    const idProfesor = Number(req.params.idProfesor);
    const resultado = await turnoService.desasignarProfesor(idTurno, idProfesor);
    return res.status(200).json(resultado);
  },

  cancelar: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const turnoCancelado = await turnoService.cancelar(id);
    return res.status(200).json({
      mensaje: 'Turno dado de baja con éxito',
      turno: turnoCancelado,
    });
  },

  remove: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await turnoService.remove(id);
    return res.status(200).json({ mensaje: 'Turno eliminado correctamente' });
  },
};