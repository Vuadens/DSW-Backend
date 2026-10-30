import { EstadoInscripcion } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateInscripcionInput, InscripcionFiltros } from '../schemas/inscripcion.schema';

const incluir = {
  socio: { include: { persona: true } },
  clase: {
    include: {
      actividad: {
        select: {
          nombre: true,
        },
      },
      profesor: { include: { persona: true } },
    },
  },
} as const;

export const inscripcionRepository = {
  // 1. Obtener las inscripciones con sus relaciones, con filtros opcionales
  findAll: (filtros: InscripcionFiltros = {}) =>
    prisma.inscripcion.findMany({
      where: {
        ...(filtros.idClase ? { idClase: filtros.idClase } : {}),
        ...(filtros.idSocio ? { idSocio: filtros.idSocio } : {}),
        ...(filtros.fecha ? { fechaClase: filtros.fecha } : {}),
        ...(filtros.estado ? { estado: filtros.estado } : {}),
      },
      include: incluir,
      orderBy: [{ fechaClase: 'asc' }, { idClase: 'asc' }],
    }),

  // 2. Buscar inscripción por su ID con sus relaciones
  findById: (idInscripcion: number) =>
    prisma.inscripcion.findUnique({
      where: { idInscripcion },
      include: incluir,
    }),

  // 3. Buscar la inscripción del socio en la clase y fecha, confirmada o cancelada.
  // Hay un unique (idSocio, idClase, fechaClase), así que puede existir a lo sumo una.
  findBySocioClaseYFecha: (idSocio: number, idClase: number, fechaClase: Date) =>
    prisma.inscripcion.findUnique({
      where: {
        idSocio_idClase_fechaClase: { idSocio, idClase, fechaClase },
      },
    }),

  // 4. Contar cupos ocupados de la clase en una fecha
  countConfirmadas: (idClase: number, fechaClase: Date) =>
    prisma.inscripcion.count({
      where: {
        idClase,
        fechaClase,
        estado: EstadoInscripcion.CONFIRMADA,
      },
    }),

  // Inscriptos por clase y fecha, para calcular la ocupación de varias clases en una consulta
  contarConfirmadasPorClaseYFecha: (idsClase: number[], fechas: Date[]) =>
    prisma.inscripcion.groupBy({
      by: ['idClase', 'fechaClase'],
      where: {
        idClase: { in: idsClase },
        fechaClase: { in: fechas },
        estado: EstadoInscripcion.CONFIRMADA,
      },
      _count: { _all: true },
    }),

  // Mayor cantidad de inscriptos de la clase en una fecha desde `desde`
  maxConfirmadasDesde: async (idClase: number, desde: Date) => {
    const grupos = await prisma.inscripcion.groupBy({
      by: ['fechaClase'],
      where: { idClase, fechaClase: { gte: desde }, estado: EstadoInscripcion.CONFIRMADA },
      _count: { _all: true },
    });
    return Math.max(0, ...grupos.map((g) => g._count._all));
  },

  // 5. Crear la inscripción
  create: (data: CreateInscripcionInput) =>
    prisma.inscripcion.create({
      data,
    }),

  // 6. Cancelar inscripción (baja lógica)
  cancelar: (idInscripcion: number) =>
    prisma.inscripcion.update({
      where: { idInscripcion },
      data: { estado: EstadoInscripcion.CANCELADA },
    }),

  // Reactivar una inscripción cancelada (nueva reserva para la misma clase y fecha)
  reactivar: (idInscripcion: number) =>
    prisma.inscripcion.update({
      where: { idInscripcion },
      data: { estado: EstadoInscripcion.CONFIRMADA, asistio: false, fechaInscripcion: new Date() },
    }),

  registrarAsistencia: (idInscripcion: number, asistio: boolean) =>
    prisma.inscripcion.update({
      where: { idInscripcion },
      data: { asistio },
    }),

  // 7. Eliminar físicamente
  remove: (idInscripcion: number) =>
    prisma.inscripcion.delete({
      where: { idInscripcion },
    }),
};
