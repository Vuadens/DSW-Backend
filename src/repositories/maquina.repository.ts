import { prisma } from '../config/prisma';
import { CreateMaquinaInput, UpdateMaquinaInput } from '../schemas/maquina.schema';

export const maquinaRepository = {
  findAll: () =>
    prisma.maquina.findMany({
      include: {
        clases: true,
      },
    }),

  findById: (idMaquina: number) =>
    prisma.maquina.findUnique({
      where: { idMaquina },
      include: {
        clases: true,
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

  
  vincularClase: (idMaquina: number, idClase: number) =>
    prisma.maquina.update({
      where: { idMaquina },
      data: {
        clases: {
          connect: { idClase },
        },
      },
      include: {
        clases: true,
      },
    }),

  
  desvincularClase: (idMaquina: number, idClase: number) =>
    prisma.maquina.update({
      where: { idMaquina },
      data: {
        clases: {
          disconnect: { idClase },
        },
      },
      include: {
        clases: true,
      },
    }),

  desvincularDeTodasLasClases: (idMaquina: number) =>
    prisma.maquina.update({
      where: { idMaquina },
      data: {
        clases: {
          set: [],
        },
      },
    }),

  remove: (idMaquina: number) =>
    prisma.maquina.delete({
      where: { idMaquina },
    }),
};