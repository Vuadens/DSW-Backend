import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export const cuotaRepository = {
  findSocioConPlan: (idSocio: number) =>
    prisma.socio.findUnique({
      where: { idPersona: idSocio },
      include: { plan: true },
    }),

  findByMes: (socioId: number, mesAnio: Date) =>
    prisma.cuota.findUnique({
      where: {
        socioId_mesAnio: { socioId, mesAnio },
      },
    }),

  create: (data: { socioId: number; mesAnio: Date; valor: Prisma.Decimal }) =>
    prisma.cuota.create({ data }),
};
