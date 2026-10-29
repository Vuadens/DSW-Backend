import { NextFunction, Request, Response } from 'express';
// Importamos todas las funciones del repositorio
import * as PlanService from '../../services/plan.service';

// Los errores se delegan con next(error) al error.middleware, que traduce
// HttpError y los codigos de Prisma (P2025 -> 404, P2003 -> 409) al status correcto.

const parsearId = (peticion: Request, respuesta: Response) => {
  const id = Number(peticion.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    respuesta.status(400).json({ error: 'El id debe ser un entero positivo' });
    return undefined;
  }
  return id;
};

//funcion READ
export const getPlanes = async (peticion: Request, respuesta: Response, next: NextFunction) => {
  try {
    const planes = await PlanService.obtenerTodosLosPlanes();
    respuesta.status(200).json(planes);
  } catch (error) {
    next(error);
  }
};


//funcion READ por ID
export const getPlanById = async (peticion: Request, respuesta: Response, next: NextFunction) => {
  const id = parsearId(peticion, respuesta);
  if (id === undefined) return;
  try {
    const plan = await PlanService.obtenerPlanPorId(id);

    if (!plan) return respuesta.status(404).json({ error: 'Plan no encontrado' });

    respuesta.status(200).json(plan);
  } catch (error) {
    next(error);
  }
};


//funcion CREATE
export const createPlan = async (peticion: Request, respuesta: Response, next: NextFunction) => {
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
    next(error);
  }
};


//funcion UPDATE
export const updatePlan = async (peticion: Request, respuesta: Response, next: NextFunction) => {
  const id = parsearId(peticion, respuesta);
  if (id === undefined) return;
  try {
    const { nombre, tipo, descripcion, precio, duracionMeses, activo } = peticion.body;

    const data = {
        ...(nombre && { nombre }),
        ...(tipo !== undefined && { tipo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio !== undefined && { precio }),
        ...(duracionMeses && { duracionMeses }),
        ...(activo !== undefined && { activo }),
    };
    const planActualizado = await PlanService.actualizarPlan(id, data);
    respuesta.status(200).json(planActualizado);
  } catch (error) {
    next(error);
  }
};

//funcion DELETE
export const deletePlan = async (peticion: Request, respuesta: Response, next: NextFunction) => {
  const id = parsearId(peticion, respuesta);
  if (id === undefined) return;
  try {
    await PlanService.eliminarPlan(id);
    respuesta.status(200).json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
