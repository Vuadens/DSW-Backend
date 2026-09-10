import { prisma } from '../config/prisma';
import { CreateActividadInput } from '../schemas/actividad.schema';

export const actividadRepository = {
  findAll: () => prisma.actividad.findMany(),
  findById: (id: number) => prisma.actividad.findUnique({ where: { id } }),
  create: (data: CreateActividadInput) => prisma.actividad.create({ data }),
  update: (id: number, data: Partial<CreateActividadInput>) =>
    prisma.actividad.update({ where: { id }, data }),
  remove: (id: number) => prisma.actividad.delete({ where: { id } }),
};