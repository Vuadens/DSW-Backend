import { NextFunction, Request, Response } from 'express';
import * as ProfesorService from '../../services/profesor.service';

export const getProfesores = async (_peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const profesores = await ProfesorService.obtenerProfesores();
		respuesta.status(200).json(profesores);
	} catch (error) {
		next(error);
	}
};

export const getProfesorById = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		const profesor = await ProfesorService.obtenerProfesorPorId(Number(id));
		respuesta.status(200).json(profesor);
	} catch (error) {
		next(error);
	}
};

export const createProfesor = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const nuevoProfesor = await ProfesorService.crearProfesor(peticion.body);
		respuesta.status(201).json(nuevoProfesor);
	} catch (error) {
		next(error);
	}
};

export const updateProfesor = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		const profesorActualizado = await ProfesorService.actualizarProfesor(Number(id), peticion.body);
		respuesta.status(200).json(profesorActualizado);
	} catch (error) {
		next(error);
	}
};

export const deleteProfesor = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		await ProfesorService.eliminarProfesor(Number(id));
		respuesta.status(200).json({ message: 'Profesor eliminado correctamente' });
	} catch (error) {
		next(error);
	}
};
