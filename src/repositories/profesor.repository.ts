import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const obtenerProfesores = async () => {
  return await prisma.profesor.findMany();
};

export const obtenerProfesorPorId = async (id: number) => {
  return await prisma.profesor.findUnique({
    where: { idProfesor: id }
  });
};

export const crearProfesor = async (data: {
  nombre: string;
  apellido: string;
  cargo: string;
}) => {
  return await prisma.profesor.create({ data });
};

export const actualizarProfesor = async (
  id: number,
  data: Partial<{
    nombre: string;
    apellido: string;
    cargo: string;
  }>
) => {
  return await prisma.profesor.update({
    where: { idProfesor: id },
    data
  });
};

export const eliminarProfesor = async (id: number) => {
  return await prisma.profesor.delete({
    where: { idProfesor: id }
  });
};