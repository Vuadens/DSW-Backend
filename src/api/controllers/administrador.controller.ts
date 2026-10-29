import { NextFunction, Request, Response } from 'express';
import * as AdministradorService from '../../services/administrador.service';

export const getAdministradores = async (_peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const administradores = await AdministradorService.obtenerAdministradores();
		respuesta.status(200).json(administradores);
	} catch (error) {
		next(error);
	}
};

export const getAdministradorById = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		const administrador = await AdministradorService.obtenerAdministradorPorId(Number(id));
		respuesta.status(200).json(administrador);
	} catch (error) {
		next(error);
	}
};

export const createAdministrador = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const nuevoAdministrador = await AdministradorService.crearAdministrador(peticion.body);
		respuesta.status(201).json(nuevoAdministrador);
	} catch (error) {
		next(error);
	}
};

export const updateAdministrador = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		const administradorActualizado = await AdministradorService.actualizarAdministrador(Number(id), peticion.body);
		respuesta.status(200).json(administradorActualizado);
	} catch (error) {
		next(error);
	}
};

export const deleteAdministrador = async (peticion: Request, respuesta: Response, next: NextFunction) => {
	try {
		const { id } = peticion.params;
		await AdministradorService.eliminarAdministrador(Number(id));
		respuesta.status(200).json({ message: 'Administrador eliminado correctamente' });
	} catch (error) {
		next(error);
	}
};
