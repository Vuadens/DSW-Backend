import { actividadRepository } from '../repositories/actividad.repository';
import { CreateActividadInput } from '../schemas/actividad.schema';
import { HttpError } from '../utils/http-error';

export const actividadService = {
  getAll: () => actividadRepository.findAll(),
  getById: async (id: number) => {
    const actividad = await actividadRepository.findById(id);
    if (!actividad) throw new HttpError(404, 'Actividad no encontrada');
    return actividad;
  },
  create: (data: CreateActividadInput) => actividadRepository.create(data),
  update: async (id: number, data: Partial<CreateActividadInput>) => {
    await actividadService.getById(id);
    return actividadRepository.update(id, data);
  },
  remove: async (id: number) => {
    await actividadService.getById(id);
    return actividadRepository.remove(id);
  },
};