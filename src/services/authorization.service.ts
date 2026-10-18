import {Rol} from '@prisma/client';
import * as profesorRepository from '../repositories/profesor.repository';

export type Actor = {
    id: number;
    rol: Rol;
    socioId?: number;
    profesorId?: number;
};

export const esPropietarioSocio = (actor: Actor, socioId: number) =>
    actor.rol === Rol.ADMINISTRADOR || actor.socioId === socioId;

export const esPropietarioProfesor = (actor: Actor, profesorId: number) =>
    actor.rol === Rol.ADMINISTRADOR || actor.profesorId === profesorId;

export const esSupervisorDe = async (actor: Actor, profesorId: number) => {
    if (actor.rol === Rol.ADMINISTRADOR) return true;
    if (actor.profesorId === undefined) return false;
    const profesor = await profesorRepository.obtenerProfesorPorId(profesorId);
    return profesor?.supervisorId === actor.profesorId;
};
