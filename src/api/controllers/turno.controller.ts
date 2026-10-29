import { Request, Response } from 'express';
import { turnoService } from '../../services/turno.service';

export const turnoController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const turnos = await turnoService.findAll();
      return res.status(200).json(turnos);
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message || 'Error al obtener los turnos' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const turno = await turnoService.findById(id);
      return res.status(200).json(turno);
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const nuevoTurno = await turnoService.create(req.body);
      return res.status(201).json(nuevoTurno);
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const turnoActualizado = await turnoService.update(id, req.body);
      return res.status(200).json(turnoActualizado);
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message });
    }
  },

  asignarProfesor: async (req: Request, res: Response) => {
    try {
      const idTurno = Number(req.params.id);
      const { idProfesor } = req.body;
      const resultado = await turnoService.asignarProfesor(idTurno, idProfesor);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message });
    }
  },

  desasignarProfesor: async (req: Request, res: Response) => {
    try {
      const idTurno = Number(req.params.id);
      const idProfesor = Number(req.params.idProfesor);
      const resultado = await turnoService.desasignarProfesor(idTurno, idProfesor);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message });
    }
  },

  obtenerProfesoresDeTurno: async (req: Request, res: Response) => {
    try {
      const idTurno = Number(req.params.id);
      const data = await turnoService.obtenerProfesoresDeTurno(idTurno);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(error.status || 404).json({ error: error.message });
    }
  },

  cancelar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const turnoCancelado = await turnoService.cancelar(id);
      return res.status(200).json({
        mensaje: 'Turno dado de baja con éxito',
        turno: turnoCancelado,
      });
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await turnoService.remove(id);
      return res.status(200).json({ mensaje: 'Turno eliminado correctamente' });
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message });
    }
  },
};