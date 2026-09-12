import { Request, Response } from 'express';
// Importamos todas las funciones del repositorio
import * as PlanService from '../../services/plan.service'; 


//funcion READ
export const getPlanes = async (peticion: Request, respuesta: Response) => {
  try {
    const planes = await PlanService.obtenerTodosLosPlanes();
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
    const plan = await PlanService.obtenerPlanPorId(Number(id));

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
    const nuevoPlan = await PlanService.crearNuevoPlan(data);
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
    const { nombre, tipo, descripcion, precio, duracionMeses, activo } = peticion.body; //create tiene las validaciones correctas, pero update no, hay que agregarla aca tambien para que no rompa la validacion de los datos
    
    const data = {
        ...(nombre !== undefined && { nombre }),
        ...(tipo !== undefined && { tipo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio !== undefined && { precio }),
        ...(duracionMeses !== undefined && { duracionMeses }), 
        ...(activo !== undefined && { activo }),
    };
    const planActualizado = await PlanService.actualizarPlan(Number(id), data);
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
    await PlanService.eliminarPlan(Number(id));
    respuesta.status(200).json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    console.log("Error al eliminar el plan:", error);
    respuesta.status(500).json({ error: 'Error al eliminar el plan' });
  }
};