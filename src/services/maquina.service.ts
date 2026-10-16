import { maquinaRepository } from '../repositories/maquina.repository';
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
  
  // 5. Regla de negocio: Inhabilitar, desvincular de clases y armar advertencia
  inhabilitar: async (idMaquina: number) => {
    const maquina = await maquinaRepository.findById(idMaquina);
    if (!maquina) {
      throw new HttpError(404, 'Máquina no encontrada');
    }

    let advertencia: string | null = null;
    let nombresClases: string[] = [];

    // Si tiene clases asociadas, las recopilamos y desvinculamos la máquina
    if (maquina.clases && maquina.clases.length > 0) {
      nombresClases = maquina.clases.map((c: any) => c.nombre || `Clase #${c.idClase}`);
      advertencia = `La máquina se planeaba usar en: '${nombresClases.join(', ')}'. Se desvinculó automáticamente.`;

      await maquinaRepository.desvincularDeTodasLasClases(idMaquina);
    }

    const maquinaActualizada = await maquinaRepository.update(idMaquina, {
      estado: 'INHABILITADA',
    });

    return {            //Mensaje de nombres de clases que estan vinculadas con la maquina dada de baja y actualiza la maquina
      mensaje: 'Máquina inhabilitada con éxito',
      advertencia,
      clasesAfectadas: nombresClases,
      maquina: maquinaActualizada,
    };
  },

  // 6. Pasar máquina a reparación
  mandarAReparacion: async (idMaquina: number) => {
    await maquinaService.findById(idMaquina);
    return await maquinaRepository.update(idMaquina, {
      estado: 'REPARACION',
    });
  },

};