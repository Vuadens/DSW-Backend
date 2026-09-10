import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
 

//funcion GET para obtener todos los planes
export const getPlanes = async (req: Request, res: Response) => {
    try {
    const planes = await prisma.plan.findMany({
      where: { activo: true } 
    });
    res.status(200).json(planes);
  } catch (error) {
    console.log("Error real de Prisma:", error);
    res.status(500).json({ error: 'Error al obtener la lista de planes' });
  }
};

//funcion POST para crear un nuevo plan
export const createPlan = async (req: Request, res: Response) => {
  try {
    const { nombre, tipo, precio, descripcion, duracionMeses, activo } = req.body;
    const nuevoPlan = await prisma.plan.create({       
        data: {
        nombre,
        tipo,
        precio: Number(precio),
        descripcion,
        duracionMeses: duracionMeses !== undefined ? Number(duracionMeses) : undefined,
        activo: activo !== undefined ? Boolean(activo) : undefined
      }
    });
    res.status(201).json(nuevoPlan);
  } catch (error) {
    console.log("Error real de Prisma al crear:", error);
    res.status(500).json({ error: 'Error al crear el nuevo plan' });
  }
};

//funcion GET by ID
export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await prisma.plan.findUnique({
      where: { idPlan: Number(id) } });

    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.log("Error al buscar el plan por ID:", error);
    res.status(500).json({ error: 'Error al obtener el plan' });
  }
};

//Funcion UPDATE
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, descripcion, precio, duracionMeses, activo } = req.body;
    const planActualizado = await prisma.plan.update({
      where: { idPlan: Number(id) },
      data: {
        ...(nombre && { nombre }),
        ...(tipo !== undefined && { tipo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio && { precio }),
        ...(duracionMeses && { duracionMeses }),
        ...(activo !== undefined && { activo }),
      },
    });

    res.status(200).json(planActualizado);
  } catch (error) {
    console.log("Error al actualizar el plan:", error);
    res.status(500).json({ error: 'Error al actualizar el plan' });
  }
};