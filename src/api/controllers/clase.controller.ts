import { NextFunction, Request, Response } from 'express';
import * as ClaseService from '../../services/clase.service';

export const getClases = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		// peticion.query ya fue validado y normalizado por validateQuery
		const clases = await ClaseService.obtenerClases(peticion.query as any);
		respuesta.status(200).json(clases);
	} catch (error) {
		next(error);
	}
};

export const getClaseById = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		const clase = await ClaseService.obtenerClasePorId(Number(id));
		respuesta.status(200).json(clase);
	} catch (error) {
		next(error);
	}
};

export const createClase = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const nuevaClase = await ClaseService.crearClase(peticion.body);
		respuesta.status(201).json(nuevaClase);
	} catch (error) {
		next(error);
	}
};

export const updateClase = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		const claseActualizada = await ClaseService.actualizarClase(Number(id), peticion.body);
		respuesta.status(200).json(claseActualizada);
	} catch (error) {
		next(error);
	}
};

export const deleteClase = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		await ClaseService.eliminarClase(Number(id));
		respuesta.status(200).json({ message: 'Clase eliminada correctamente' });
	} catch (error) {
		next(error);
	}
};
