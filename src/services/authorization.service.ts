import {Rol} from '@prisma/client';

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
