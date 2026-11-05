import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { PersonaInput } from '../schemas/persona.schema';
import * as PersonaRepository from './persona.repository';

const incluir = {
  persona: { include: { usuario: { select: { email: true } } } },
  turnos: true
} as const;

export const obtenerProfesores = async () => {
  return await prisma.profesor.findMany({ include: incluir });
};

export const obtenerProfesorPorId = async (id: number) => {
  return await prisma.profesor.findUnique({
    where: { idPersona: id },
    include: incluir
  });
};

export const crearProfesor = async (
  data: PersonaInput & { cargo: string },
  cuenta: Prisma.UsuarioCreateWithoutPersonaInput
) => {
  const { persona, resto } = PersonaRepository.separarPersona(data);
  return await prisma.profesor.create({
    data: {
      cargo: resto.cargo,
      persona: { create: { ...(persona as PersonaInput), usuario: { create: cuenta } } }
    },
    include: incluir
  });
};

export const actualizarProfesor = async (
  id: number,
  data: Partial<PersonaInput & { cargo: string }>
) => {
  const { persona, resto } = PersonaRepository.separarPersona(data);
  return await prisma.profesor.update({
    where: { idPersona: id },
    data: {
      ...resto,
      ...(Object.keys(persona).length > 0 ? { persona: { update: persona } } : {})
    },
    include: incluir
  });
};

// Baja lógica: se registra la fecha, se lo quita de sus turnos y se desactiva su cuenta.
export const darDeBaja = async (id: number, fechaBaja: Date) => {
  const [profesor] = await prisma.$transaction([
    prisma.profesor.update({
      where: { idPersona: id },
      data: { fechaBaja, turnos: { set: [] } },
      include: incluir
    }),
    prisma.usuario.updateMany({ where: { personaId: id }, data: { activo: false } })
  ]);
  return profesor;
};

// Reactivación: vuelve a operar y recupera el acceso. Los turnos se asignan de nuevo a mano.
export const reactivar = async (id: number) => {
  const [profesor] = await prisma.$transaction([
    prisma.profesor.update({ where: { idPersona: id }, data: { fechaBaja: null }, include: incluir }),
    prisma.usuario.updateMany({ where: { personaId: id }, data: { activo: true } })
  ]);
  return profesor;
};

export const contarClasesAsignadas = async (idProfesor: number): Promise<number> => {
  return await prisma.clase.count({
    where: { idProfesor: idProfesor }
  });
};
