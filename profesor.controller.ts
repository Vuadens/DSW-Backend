import { Request, Response } from 'express';
import * as ProfesorRepository from '../../repositories/profesor.repository';

export const getProfesores = async (_peticion: Request, respuesta: Response) => {
	try {
		const profesores = await ProfesorRepository.obtenerProfesores();
		respuesta.status(200).json(profesores);
	} catch (error) {
		console.log('Error real de Prisma:', error);
		respuesta.status(500).json({ error: 'Error al obtener la lista de profesores' });
	}
};

export const getProfesorById = async (peticion: Request, respuesta: Response) => {
	try {
		const { id } = peticion.params;
		const profesor = await ProfesorRepository.obtenerProfesorPorId(Number(id));

		if (!profesor) {
			return respuesta.status(404).json({ error: 'Profesor no encontrado' });
		}

		respuesta.status(200).json(profesor);
	} catch (error) {
		console.log('Error al buscar el profesor por ID:', error);
		respuesta.status(500).json({ error: 'Error al obtener el profesor' });
	}
};

export const createProfesor = async (peticion: Request, respuesta: Response) => {
	try {
		const { nombre, apellido, cargo } = peticion.body;
		const nuevoProfesor = await ProfesorRepository.crearProfesor({
			nombre,
			apellido,
			cargo
		});

		respuesta.status(201).json(nuevoProfesor);
	} catch (error) {
		console.log('Error real de Prisma al crear:', error);
		respuesta.status(500).json({ error: 'Error al crear el nuevo profesor' });
	}
};

export const updateProfesor = async (peticion: Request, respuesta: Response) => {
	try {
		const { id } = peticion.params;
		const { nombre, apellido, cargo } = peticion.body;
		const data = {
			...(nombre !== undefined && { nombre }),
			...(apellido !== undefined && { apellido }),
			...(cargo !== undefined && { cargo })
		};

		const profesorActualizado = await ProfesorRepository.actualizarProfesor(Number(id), data);
		respuesta.status(200).json(profesorActualizado);
	} catch (error) {
		console.log('Error al actualizar el profesor:', error);
		respuesta.status(500).json({ error: 'Error al actualizar el profesor' });
	}
};

export const deleteProfesor = async (peticion: Request, respuesta: Response) => {
	try {
		const { id } = peticion.params;
		await ProfesorRepository.eliminarProfesor(Number(id));
		respuesta.status(200).json({ message: 'Profesor eliminado correctamente' });
	} catch (error) {
		console.log('Error al eliminar el profesor:', error);
		respuesta.status(500).json({ error: 'Error al eliminar el profesor' });
	}
};
