import { prisma } from '../config/prisma';
import { PersonaInput } from '../schemas/persona.schema';
import * as PersonaRepository from './persona.repository';

const incluir = { persona: true } as const;

export const obtenerAdministradores = async () => {
  return await prisma.administrador.findMany({ include: incluir });
};

export const obtenerAdministradorPorId = async (id: number) => {
  return await prisma.administrador.findUnique({
    where: { idPersona: id },
    include: incluir
  });
};

export const crearAdministrador = async (data: PersonaInput) => {
  return await prisma.administrador.create({
    data: { persona: { create: data } },
    include: incluir
  });
};

export const actualizarAdministrador = async (id: number, data: Partial<PersonaInput>) => {
  return await prisma.administrador.update({
    where: { idPersona: id },
    data: { persona: { update: data } },
    include: incluir
  });
};

export const eliminarAdministrador = async (id: number) => {
  const [administrador] = await prisma.$transaction([
    prisma.administrador.delete({ where: { idPersona: id } }),
    PersonaRepository.eliminarSiNoTieneRoles(id)
  ]);
  return administrador;
};
