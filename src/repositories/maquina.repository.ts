import { prisma } from '../config/prisma';
import { CreateMaquinaInput, UpdateMaquinaInput } from '../schemas/maquina.schema';

export const maquinaRepository = {
  findAll: () =>
    prisma.maquina.findMany({
      include: {
        actividades: true,
      },
    }),

  findById: (idMaquina: number) =>
    prisma.maquina.findUnique({
      where: { idMaquina },
      include: {
        actividades: true,
      },
    }),

  create: (data: CreateMaquinaInput) =>
    prisma.maquina.create({
      data,
    }),

  update: (idMaquina: number, data: UpdateMaquinaInput | any) =>
    prisma.maquina.update({
      where: { idMaquina },
      data,
    }),

  
  vincularActividad: (idMaquina: number, idActividad: number) =>
    prisma.maquina.update({
      where: { idMaquina },
      data: {
        actividades: {
          connect: { id: idActividad },
        },
      },
      include: {
        actividades: true,
      },
    }),

  
  desvincularActividad: (idMaquina: number, idActividad: number) =>
    prisma.maquina.update({
      where: { idMaquina },
      data: {
        actividades: {
          disconnect: { id: idActividad },
        },
      },
      include: {
        actividades: true,
      },
    }),

  desvincularDeTodasLasActividades: (idMaquina: number) =>
    prisma.maquina.update({
      where: { idMaquina },
      data: {
        actividades: {
          set: [],
        },
      },
    }),

  remove: (idMaquina: number) =>
    prisma.maquina.delete({
      where: { idMaquina },
    }),
};