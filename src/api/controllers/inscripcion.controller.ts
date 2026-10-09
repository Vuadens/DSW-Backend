import { Request, Response } from 'express';
import { inscripcionService } from '../../services/inscripcion.service';

export const inscripcionController = {

  getAll: async (_req: Request, res: Response) => {
    try {
      const inscripciones = await inscripcionService.findAll();
      return res.status(200).json(inscripciones);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error al obtener las inscripciones' });
    }
  },


  getById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const inscripcion = await inscripcionService.findById(id);
      return res.status(200).json(inscripcion);
    } catch (error: any) {
      if (error.message === 'Inscripción no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || 'Error al buscar la inscripción' });
    }
  },

  
  create: async (req: Request, res: Response) => {
    try {
      // req.body ya viene validado y transformado por el middleware de Zod
      const nuevaInscripcion = await inscripcionService.create(req.body);
      return res.status(201).json(nuevaInscripcion);
    } catch (error: any) {
      // Las reglas de negocio lanzadas por el Service se devuelven como 400 (Bad Request)
      return res.status(400).json({ error: error.message });
    }
  },

  // Baja lógica
  cancelar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const inscripcionCancelada = await inscripcionService.cancelar(id);
      return res.status(200).json({
        mensaje: 'Inscripción cancelada con éxito',
        inscripcion: inscripcionCancelada,
      });
    } catch (error: any) {
      if (error.message === 'Inscripción no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  },

  // Baja fisica
  remove: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await inscripcionService.remove(id);
      return res.status(200).json({ mensaje: 'Inscripción eliminada correctamente' });
    } catch (error: any) {
      if (error.message === 'Inscripción no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message || 'Error al eliminar la inscripción' });
    }
  },
};