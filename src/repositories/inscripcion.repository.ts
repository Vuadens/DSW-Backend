import { prisma } from '../config/prisma';
import { CreateInscripcionInput } from '../schemas/inscripcion.schema';

export const inscripcionRepository = {
  // 1. Obtener todas las inscripciones activas con sus relaciones
  findAll: () =>
    prisma.inscripcion.findMany({
      where: { activo: true },
      include: {
        socio: true,
        clase: {
          include: {
            actividad: {
              select: {
                nombre: true,
              },
            },
            profesor: true,
          },
        },
      },
    }),

  // 2. Buscar inscripción por su ID con sus relaciones
  findById: (idInscripcion: number) =>
    prisma.inscripcion.findUnique({
      where: { idInscripcion },
      include: {
        socio: true,
        clase: {
          include: {
            actividad: {
              select: {
                nombre: true,
              },
            },
            profesor: true,
          },
        },
      },
    }),

  // 3. Buscar la inscripción del socio en la clase, activa o cancelada.
  // Hay un unique (idSocio, idClase), así que puede existir a lo sumo una.
  findBySocioYClase: (idSocio: number, idClase: number) =>
    prisma.inscripcion.findUnique({
      where: {
        idSocio_idClase: { idSocio, idClase },
      },
    }),

  // 4. Contar cupos ocupados activos en la clase
  countActivasByClase: (idClase: number) =>
    prisma.inscripcion.count({
      where: {
        idClase,
        activo: true,
      },
    }),

  // 5. Crear la inscripción
  create: (data: CreateInscripcionInput) =>
    prisma.inscripcion.create({
      data,
    }),

  // 6. Cancelar inscripción (baja lógica)
  cancelar: (idInscripcion: number) =>
    prisma.inscripcion.update({
      where: { idInscripcion },
      data: { activo: false },
    }),

  // Reactivar una inscripción cancelada (re-inscripción a la misma clase)
  reactivar: (idInscripcion: number) =>
    prisma.inscripcion.update({
      where: { idInscripcion },
      data: { activo: true, fechaInscripcion: new Date() },
    }),

  // 7. Eliminar físicamente
  remove: (idInscripcion: number) =>
    prisma.inscripcion.delete({
      where: { idInscripcion },
    }),
};