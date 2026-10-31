import * as ProfesorRepository from '../repositories/profesor.repository';
import { HttpError } from '../utils/http-error';
import { Rol } from '@prisma/client';
import { Actor, esPropietarioProfesor } from './authorization.service';
import { guardarEmail, nuevaCuenta, validarDniUnico, validarEmailUnico } from './persona.service';
import { PersonaInput } from '../schemas/persona.schema';

export type CrearProfesorData = PersonaInput & {
  email: string;
  cargo: string;
};

export type ActualizarProfesorData = Partial<CrearProfesorData>;

export const obtenerProfesores = async (actor: Actor) => {
  if (actor.rol === Rol.SOCIO) throw new HttpError(403, 'No puede acceder a profesores');
  const profesores = await ProfesorRepository.obtenerProfesores();
  if (actor.rol === Rol.ADMINISTRADOR) return profesores;
  return profesores.filter((profesor) => profesor.idPersona === actor.personaId);
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

export const crearProfesor = async ({ email, ...data }: CrearProfesorData) => {
  await validarDniUnico(data.dni);
  await validarEmailUnico(email);
  return ProfesorRepository.crearProfesor(data, await nuevaCuenta(email, data.dni, Rol.PROFESOR));
};

export const actualizarProfesor = async (id: number, { email, ...data }: ActualizarProfesorData, actor: Actor) => {
  const profesor = await obtenerProfesorPorId(id, actor);
  if (data.dni !== undefined) await validarDniUnico(data.dni, id);
  if (email !== undefined) await guardarEmail(id, email, data.dni ?? profesor.persona.dni, Rol.PROFESOR);
  const updateData = {...data};
  if (actor.rol === Rol.PROFESOR) {
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
