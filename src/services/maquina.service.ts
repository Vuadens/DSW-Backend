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

  vincularActividad: async (idMaquina: number, idActividad: number) => {
    const maquina = await maquinaService.findById(idMaquina);

    if (maquina.estado !== 'DISPONIBLE') {
      throw new HttpError(
        400,
        `No se puede vincular la máquina porque su estado actual es ${maquina.estado}`
      );
    }

    const actividadExiste = await prisma.actividad.findUnique({ where: { id: idActividad } });
    if (!actividadExiste) {
      throw new HttpError(404, 'La actividad especificada no existe');
    }

    return await maquinaRepository.vincularActividad(idMaquina, idActividad);
  },

  desvincularActividad: async (idMaquina: number, idActividad: number) => {
    await maquinaService.findById(idMaquina);
    return await maquinaRepository.desvincularActividad(idMaquina, idActividad);
  },

  inhabilitar: async (idMaquina: number) => {
    const maquina = await maquinaRepository.findById(idMaquina);
    if (!maquina) {
      throw new HttpError(404, 'Máquina no encontrada');
    }

    let advertencia: string | null = null;
    let nombresActividades: string[] = [];

    if (maquina.actividades.length > 0) {
      nombresActividades = maquina.actividades.map((a) => a.nombre);
      advertencia = `La máquina se planeaba usar en: '${nombresActividades.join(', ')}'. Se desvinculó automáticamente.`;

      await maquinaRepository.desvincularDeTodasLasActividades(idMaquina);
    }

    const maquinaActualizada = await maquinaRepository.update(idMaquina, {
      estado: 'INHABILITADA',
    });

    return {
      mensaje: 'Máquina inhabilitada con éxito',
      advertencia,
      actividadesAfectadas: nombresActividades,
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
    if (maquina.actividades.length > 0) {
      throw new HttpError(
        400,
        'No se puede eliminar la máquina físicamente porque está vinculada a actividades'
      );
    }
    return await maquinaRepository.remove(idMaquina);
  },
};