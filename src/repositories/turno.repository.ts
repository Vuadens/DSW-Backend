import { prisma } from '../config/prisma';
import { CreateTurnoInput, UpdateTurnoInput } from '../schemas/turno.schema';

export const turnoRepository = {
  findAll: () =>
    prisma.turno.findMany({
      where: { activo: true },
      include: {
        profesores: true,
      },
    }),

  findById: (idTurno: number) =>
    prisma.turno.findUnique({
      where: { idTurno },
      include: {
        profesores: true,
      },
    }),

  findByDiaYHorario: (diaSemana: any, horaDesde: string, horaHasta: string) =>
    prisma.turno.findFirst({
      where: {
        diaSemana,
        horaDesde,
        horaHasta,
        activo: true,
      },
    }),

  create: (data: CreateTurnoInput) =>
    prisma.turno.create({
      data,
    }),

  update: (idTurno: number, data: UpdateTurnoInput) =>
    prisma.turno.update({
      where: { idTurno },
      data,
    }),

  asignarProfesor: (idTurno: number, idProfesor: number) =>
    prisma.turno.update({
      where: { idTurno },
      data: {
        profesores: {
          connect: { idProfesor },
        },
      },
      include: {
        profesores: true,
      },
    }),

  desasignarProfesor: (idTurno: number, idProfesor: number) =>
    prisma.turno.update({
      where: { idTurno },
      data: {
        profesores: {
          disconnect: { idProfesor },
        },
      },
      include: {
        profesores: true,
      },
    }),

  cancelar: (idTurno: number) =>
    prisma.turno.update({
      where: { idTurno },
      data: { activo: false },
    }),

  remove: (idTurno: number) =>
    prisma.turno.delete({
      where: { idTurno },
    }),
    // Obtener la lista de profesores asignados a un turno
obtenerProfesoresDeTurno: (idTurno: number) =>
  prisma.turno.findUnique({
    where: { idTurno },
    select: {
      idTurno: true,
      nombre: true,
      diaSemana: true,
      horaDesde: true,
      horaHasta: true,
      profesores: {
        select: {
          idProfesor: true,
          nombre: true,
          apellido: true,
          cargo: true,
        },
      },
    },
  }),
};