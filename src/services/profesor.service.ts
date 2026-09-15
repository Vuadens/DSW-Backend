import * as ProfesorRepository from '../repositories/profesor.repository';
import { HttpError } from '../utils/http-error';

export type CrearProfesorData = {
  nombre: string;
  apellido: string;
  cargo: string;
};

export type ActualizarProfesorData = Partial<CrearProfesorData>;

export const obtenerProfesores = async () => {
  return ProfesorRepository.obtenerProfesores();
};

export const obtenerProfesorPorId = async (id: number) => {
  const profesor = await ProfesorRepository.obtenerProfesorPorId(id);
  if (!profesor) {
    throw new HttpError(404, 'Profesor no encontrado');
  }
  return profesor;
};

export const crearProfesor = async (data: CrearProfesorData) => {
  return ProfesorRepository.crearProfesor(data);
};

export const actualizarProfesor = async (id: number, data: ActualizarProfesorData) => {
  await obtenerProfesorPorId(id);
  return ProfesorRepository.actualizarProfesor(id, data);
};

export const eliminarProfesor = async (id: number) => {
  await obtenerProfesorPorId(id);
  return ProfesorRepository.eliminarProfesor(id);
};
