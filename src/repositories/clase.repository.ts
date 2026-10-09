import { prisma } from '../config/prisma';
import type { ClaseFiltros, ClaseInput } from '../schemas/clase.schema';

// Para que el frontend tenga el nombre de la actividad y del profesor sin pedidos extra.
const incluir = { actividad: true, profesor: true } as const;

export const obtenerClases = async (filtros: ClaseFiltros = {}) => {
  return await prisma.clase.findMany({
    where: {
      ...(filtros.dia ? { diaSemana: filtros.dia } : {}),
      ...(filtros.idProfesor ? { idProfesor: filtros.idProfesor } : {}),
      ...(filtros.idActividad ? { idActividad: filtros.idActividad } : {})
    },
    include: incluir,
    orderBy: [{ diaSemana: 'asc' }, { horaDesde: 'asc' }]
  });
};

export const obtenerClasePorId = async (id: number) => {
  return await prisma.clase.findUnique({
    where: { idClase: id },
    include: incluir
  });
};

// clases de un profesor en un dia, para detectar superposicion de horarios
export const obtenerClasesDeProfesorEnDia = async (
  idProfesor: number,
  diaSemana: ClaseInput['diaSemana'],
  excluirIdClase?: number
) => {
  return await prisma.clase.findMany({
    where: {
      idProfesor,
      diaSemana,
      ...(excluirIdClase ? { NOT: { idClase: excluirIdClase } } : {})
    }
  });
};

export const crearClase = async (data: ClaseInput) => {
  return await prisma.clase.create({ data, include: incluir });
};

export const actualizarClase = async (id: number, data: Partial<ClaseInput>) => {
  return await prisma.clase.update({
    where: { idClase: id },
    data,
    include: incluir
  });
};

export const eliminarClase = async (id: number) => {
  return await prisma.clase.delete({ where: { idClase: id } });
};
