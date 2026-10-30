import { maquinaRepository } from '../repositories/maquina.repository';
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { CreateMaquinaInput, UpdateMaquinaInput } from '../schemas/maquina.schema';

export const maquinaService = {
  findAll: async () => {
    return await maquinaRepository.findAll();
  },

  findById: async (idMaquina: number) => {
    const maquina = await maquinaRepository.findById(idMaquina);
    if (!maquina) {
      throw new HttpError(404, 'Máquina no encontrada');
    }
    return maquina;
  },

  create: async (data: CreateMaquinaInput) => {
    return await maquinaRepository.create(data);
  },

  update: async (idMaquina: number, data: UpdateMaquinaInput) => {
    await maquinaService.findById(idMaquina);
    return await maquinaRepository.update(idMaquina, data);
  },

  vincularClase: async (idMaquina: number, idClase: number) => {
    const maquina = await maquinaService.findById(idMaquina);

    if (maquina.estado !== 'DISPONIBLE') {
      throw new HttpError(
        400,
        `No se puede vincular la máquina porque su estado actual es ${maquina.estado}`
      );
    }

    const claseExiste = await prisma.clase.findUnique({ where: { idClase } });
    if (!claseExiste) {
      throw new HttpError(404, 'La clase especificada no existe');
    }

    return await maquinaRepository.vincularClase(idMaquina, idClase);
  },

  desvincularClase: async (idMaquina: number, idClase: number) => {
    await maquinaService.findById(idMaquina);
    return await maquinaRepository.desvincularClase(idMaquina, idClase);
  },

  inhabilitar: async (idMaquina: number) => {
    const maquina = await maquinaRepository.findById(idMaquina);
    if (!maquina) {
      throw new HttpError(404, 'Máquina no encontrada');
    }

    let advertencia: string | null = null;
    let nombresClases: string[] = [];

    if (maquina.clases && maquina.clases.length > 0) {
      nombresClases = maquina.clases.map((c: any) => c.nombre || `Clase #${c.idClase}`);
      advertencia = `La máquina se planeaba usar en: '${nombresClases.join(', ')}'. Se desvinculó automáticamente.`;

      await maquinaRepository.desvincularDeTodasLasClases(idMaquina);
    }

    const maquinaActualizada = await maquinaRepository.update(idMaquina, {
      estado: 'INHABILITADA',
    });

    return {
      mensaje: 'Máquina inhabilitada con éxito',
      advertencia,
      clasesAfectadas: nombresClases,
      maquina: maquinaActualizada,
    };
  },

  mandarAReparacion: async (idMaquina: number) => {
    await maquinaService.findById(idMaquina);
    return await maquinaRepository.update(idMaquina, {
      estado: 'REPARACION',
    });
  },

  remove: async (idMaquina: number) => {
    const maquina = await maquinaService.findById(idMaquina);
    if (maquina.clases && maquina.clases.length > 0) {
      throw new HttpError(
        400,
        'No se puede eliminar la máquina físicamente porque está vinculada a clases activas'
      );
    }
    return await maquinaRepository.remove(idMaquina);
  },
};