import { PrismaClient } from '@prisma/client';

// Centralizamos la conexión a la base de datos aquí
//export const prisma = new PrismaClient(); declarar en el config/prisma.ts e importar desde ahí siempre, en vez de declarar en cada repositorio
import { prisma } from '../config/prisma'; // Importamos la instancia de Prisma desde el archivo de configuración :)
//método GET para obtener todos los planes activos
export const obtenerPlanes = async () => {
  return await prisma.plan.findMany({
    where: { activo: true } 
  });
};

//método GET por ID
export const obtenerPlanPorId = async (id: number) => {
  return await prisma.plan.findUnique({
    where: { idPlan: id } 
  });
};


//metodo CREATE
export const crearPlan = async (data: any) => {
  return await prisma.plan.create({ data });
};

//método UPDATE
export const actualizarPlan = async (id: number, data: any) => {
  return await prisma.plan.update({
    where: { idPlan: id },
    data: data,
  });
};

// método DELETE 
export const eliminarPlan = async (id: number) => {
  return await prisma.plan.delete({
    where: { idPlan: id }
  });
};

//funcion para validar si existe un plan con el mismo nombre antes de crear uno nuevo
export const obtenerPlanPorNombre = async (nombre: string) => {
  return await prisma.plan.findFirst({
    where: { nombre: nombre }
  });
};