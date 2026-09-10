import { PrismaClient } from '@prisma/client';

// Centralizamos la conexión a la base de datos aquí
export const prisma = new PrismaClient();

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