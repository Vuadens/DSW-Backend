import { actividadRepository } from '../repositories/actividad.repository';
import { CreateActividadInput } from '../schemas/actividad.schema';
import { HttpError } from '../utils/http-error';

const CUPO_MAXIMO_LIMITE = 500;

export const actividadService = {
  getAll: () => actividadRepository.findAll(),

  getById: async (id: number) => {
    const actividad = await actividadRepository.findById(id);

    if (!actividad) {
      throw new HttpError(404, 'Actividad no encontrada');
    }
    return actividad;
  },

  create: async (data: CreateActividadInput) => {
    const nombreNormalizado = data.nombre.trim();

    const existente = await actividadRepository.findByNombre(nombreNormalizado);
    if (existente) {
      throw new HttpError(409, 'Ya existe una actividad con ese nombre');
    }

    if (data.cupoMaximo > CUPO_MAXIMO_LIMITE) {
      throw new HttpError(400, `El cupo máximo no puede superar ${CUPO_MAXIMO_LIMITE}`);
    }

    return actividadRepository.create({ ...data, nombre: nombreNormalizado });
  },

  update: async (id: number, data: Partial<CreateActividadInput>) => {
    await actividadService.getById(id);

    if (data.nombre) {
      const nombreNormalizado = data.nombre.trim();
      const existente = await actividadRepository.findByNombre(nombreNormalizado, id);
      if (existente) {
        throw new HttpError(409, 'Ya existe otra actividad con ese nombre');
      }
      data.nombre = nombreNormalizado;
    }

    if (data.cupoMaximo !== undefined && data.cupoMaximo > CUPO_MAXIMO_LIMITE) {
      throw new HttpError(400, `El cupo máximo no puede superar ${CUPO_MAXIMO_LIMITE}`);
    }

    return actividadRepository.update(id, data);
  },

  remove: async (id: number) => {
    await actividadService.getById(id);
    return actividadRepository.remove(id);
  },
};