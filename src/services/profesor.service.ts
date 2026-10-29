import * as ProfesorRepository from '../repositories/profesor.repository';
import { HttpError } from '../utils/http-error';
import { Rol } from '@prisma/client';
import { Actor, esPropietarioProfesor } from './authorization.service';

export type CrearProfesorData = {
  nombre: string;
  apellido: string;
  cargo: string;
};

export type ActualizarProfesorData = Partial<CrearProfesorData>;

export const obtenerProfesores = async (actor: Actor) => {
  if (actor.rol === Rol.SOCIO) throw new HttpError(403, 'No puede acceder a profesores');
  const profesores = await ProfesorRepository.obtenerProfesores();
  if (actor.rol === Rol.ADMINISTRADOR || actor.profesorId === undefined) return profesores;
  return profesores.filter((profesor) => profesor.idProfesor === actor.profesorId);
};

export const obtenerProfesorPorId = async (id: number, actor?: Actor) => {
  if (actor?.rol === Rol.SOCIO) throw new HttpError(403, 'No puede acceder a profesores');
  const profesor = await ProfesorRepository.obtenerProfesorPorId(id);
  if (!profesor) {
    throw new HttpError(404, 'Profesor no encontrado');
  }
  if (actor && actor.rol === Rol.PROFESOR && !esPropietarioProfesor(actor, id)) {
    throw new HttpError(403, 'No puede acceder a este profesor');
  }
  return profesor;
};

export const crearProfesor = async (data: CrearProfesorData) => {
  return ProfesorRepository.crearProfesor(data);
};

export const actualizarProfesor = async (id: number, data: ActualizarProfesorData, actor: Actor) => {
  await obtenerProfesorPorId(id, actor);
  const updateData = {...data};
  if (actor.rol === Rol.PROFESOR && actor.profesorId === id) {
    delete updateData.cargo;
  }
  return ProfesorRepository.actualizarProfesor(id, updateData);
};

export const eliminarProfesor = async (id: number) => {
  await obtenerProfesorPorId(id);
  const cantidadClases = await ProfesorRepository.contarClasesAsignadas(id);
  if (cantidadClases > 0) {
    throw new HttpError(
      400,
      `No se puede eliminar el profesor porque tiene ${cantidadClases} clase(s) asignada(s)`
    );
  }
  return ProfesorRepository.eliminarProfesor(id);
};
