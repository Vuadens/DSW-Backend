import {Rol} from '@prisma/client';

// Con clave primaria compartida, el id de socio y el de profesor son el
// idPersona: alcanza con comparar el personaId del token y el rol.
export type Actor = {
    id: number;
    rol: Rol;
    personaId: number;
};

export const esPropietarioSocio = (actor: Actor, idSocio: number) =>
    actor.rol === Rol.ADMINISTRADOR || (actor.rol === Rol.SOCIO && actor.personaId === idSocio);

export const esPropietarioProfesor = (actor: Actor, idProfesor: number) =>
    actor.rol === Rol.ADMINISTRADOR || (actor.rol === Rol.PROFESOR && actor.personaId === idProfesor);
