import { Request, Response } from 'express';
// Importamos todas las funciones del repositorio
import * as PlanRepository from '../../repositories/plan.repository'; 


//funcion READ
export const getPlanes = async (peticion: Request, respuesta: Response) => {
  try {
    const planes = await PlanRepository.obtenerPlanes();
    respuesta.status(200).json(planes);
  } catch (error) {
    console.log("Error real de Prisma:", error);
    respuesta.status(500).json({ error: 'Error al obtener la lista de planes' });
  }
};


//funcion READ por ID
export const getPlanById = async (peticion: Request, respuesta: Response) => {
  try {
    const { id } = peticion.params;
    const plan = await PlanRepository.obtenerPlanPorId(Number(id));

    if (!plan) return respuesta.status(404).json({ error: 'Plan no encontrado' });
    
    respuesta.status(200).json(plan);
  } catch (error) {
    console.log("Error al buscar el plan por ID:", error);
    respuesta.status(500).json({ error: 'Error al obtener el plan' });
  }
};


//funcion CREATE
export const createPlan = async (peticion: Request, respuesta: Response) => {
  try {
    const { nombre, tipo, precio, descripcion, duracionMeses, activo } = peticion.body;

    const data = {
        nombre,
        tipo,
        precio: Number(precio),
        descripcion,
        duracionMeses: duracionMeses !== undefined ? Number(duracionMeses) : undefined,
        activo: activo !== undefined ? Boolean(activo) : undefined
    };
    const nuevoPlan = await PlanRepository.crearPlan(data);
    respuesta.status(201).json(nuevoPlan);
  } catch (error) {
    console.log("Error real de Prisma al crear:", error);
    respuesta.status(500).json({ error: 'Error al crear el nuevo plan' });
  }
};


//funcion UPDATE
export const updatePlan = async (peticion: Request, respuesta: Response) => {
  try {
    const { id } = peticion.params;
    const { nombre, tipo, descripcion, precio, duracionMeses, activo } = peticion.body;
    
    const data = {
        ...(nombre && { nombre }),
        ...(tipo !== undefined && { tipo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio && { precio }),
        ...(duracionMeses && { duracionMeses }),
        ...(activo !== undefined && { activo }),
    };
    const planActualizado = await PlanRepository.actualizarPlan(Number(id), data);
    respuesta.status(200).json(planActualizado);
  } catch (error) {
    console.log("Error al actualizar el plan:", error);
    respuesta.status(500).json({ error: 'Error al actualizar el plan' });
  }
};

//funcion DELETE
export const deletePlan = async (peticion: Request, respuesta: Response) => {
  try {
    const { id } = peticion.params;
    await PlanRepository.eliminarPlan(Number(id));
    respuesta.status(200).json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    console.log("Error al eliminar el plan:", error);
    respuesta.status(500).json({ error: 'Error al eliminar el plan' });
  }
};