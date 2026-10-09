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

  // 3. Buscar si el socio ya tiene una inscripción activa en la clase (para evitar duplicados)
  findBySocioYClase: (idSocio: number, idClase: number) =>
    prisma.inscripcion.findFirst({
      where: {
        idSocio,
        idClase,
        activo: true,
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

  // 7. Eliminar físicamente
  remove: (idInscripcion: number) =>
    prisma.inscripcion.delete({
      where: { idInscripcion },
    }),
};