import { prisma } from '../config/prisma';
import { CreateActividadInput } from '../schemas/actividad.schema';

// Los planes que incluyen la actividad y las máquinas que usa, para que el frontend no haga pedidos extra.
const incluir = {
  planes: { select: { idPlan: true, nombre: true } },
  maquinas: { select: { idMaquina: true, nombre: true } },
} as const;

const conPlanes = (planes?: number[]) =>
  planes !== undefined ? { planes: { set: planes.map((idPlan) => ({ idPlan })) } } : {};

export const actividadRepository = {
  findAll: () => prisma.actividad.findMany({ include: incluir }),

  findById: (id: number) => prisma.actividad.findUnique({ where: { id }, include: incluir }),

  findByNombre: (nombre: string, excludeId?: number) =>
      prisma.actividad.findFirst({
        where: {
          nombre: { equals: nombre },
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      }),

  create: ({ planes, ...data }: CreateActividadInput) =>
      prisma.actividad.create({
        data: { ...data, ...(planes ? { planes: { connect: planes.map((idPlan) => ({ idPlan })) } } : {}) },
        include: incluir,
      }),

  update: (id: number, { planes, ...data }: Partial<CreateActividadInput>) =>
      prisma.actividad.update({ where: { id }, data: { ...data, ...conPlanes(planes) }, include: incluir }),

  remove: (id: number) => prisma.actividad.delete({ where: { id } }),
};
