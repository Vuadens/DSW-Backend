import { Request, Response } from 'express';
import { maquinaService } from '../../services/maquina.service';

export const maquinaController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const maquinas = await maquinaService.findAll();
      return res.status(200).json(maquinas);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message || 'Error al obtener las máquinas',
      });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const maquina = await maquinaService.findById(id);
      return res.status(200).json(maquina);
    } catch (error: any) {
      if (error.message === 'Máquina no encontrada' || error.status === 404) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(error.status || 500).json({
        error: error.message || 'Error al buscar la máquina',
      });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const nuevaMaquina = await maquinaService.create(req.body);
      return res.status(201).json(nuevaMaquina);
    } catch (error: any) {
      return res.status(error.status || 400).json({
        error: error.message || 'Error al crear la máquina',
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const maquinaActualizada = await maquinaService.update(id, req.body);
      return res.status(200).json(maquinaActualizada);
    } catch (error: any) {
      if (error.message === 'Máquina no encontrada' || error.status === 404) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(error.status || 400).json({
        error: error.message || 'Error al actualizar la máquina',
      });
    }
  },

  inhabilitar: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const resultado = await maquinaService.inhabilitar(id);
      return res.status(200).json(resultado);
    } catch (error: any) {
      if (error.message === 'Máquina no encontrada' || error.status === 404) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(error.status || 400).json({
        error: error.message || 'Error al inhabilitar la máquina',
      });
    }
  },

  mandarAReparacion: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const maquina = await maquinaService.mandarAReparacion(id);
      return res.status(200).json({
        mensaje: 'Máquina enviada a reparación con éxito',
        maquina,
      });
    } catch (error: any) {
      if (error.message === 'Máquina no encontrada' || error.status === 404) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(error.status || 400).json({
        error: error.message || 'Error al enviar la máquina a reparación',
      });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await maquinaService.remove(id);
      return res.status(200).json({
        mensaje: 'Máquina eliminada correctamente',
      });
    } catch (error: any) {
      if (error.message === 'Máquina no encontrada' || error.status === 404) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(error.status || 400).json({
        error: error.message || 'Error al eliminar la máquina',
      });
    }
  },
};