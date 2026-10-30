import {Prisma, Rol} from '@prisma/client';
import {usuarioRepository} from '../repositories/usuario.repository';
import {CreateUsuarioInput, UpdateUsuarioInput} from '../schemas/usuario.schema';
import {hashPassword} from '../utils/password';
import {HttpError} from '../utils/http-error';
import * as personaRepository from '../repositories/persona.repository';

// La persona debe existir, no tener otro usuario y cumplir el rol indicado.
const validarPersona = async (personaId: number, rol: Rol, idUsuarioActual?: number) => {
    const persona = await personaRepository.findById(personaId);
    if (!persona) throw new HttpError(404, 'Persona no encontrada');
    if (persona.usuario && persona.usuario.idUsuario !== idUsuarioActual) {
        throw new HttpError(409, 'La persona ya esta vinculada a otro usuario');
    }
    const cumpleRol = {
        [Rol.SOCIO]: persona.socio !== null,
        [Rol.PROFESOR]: persona.profesor !== null,
        [Rol.ADMINISTRADOR]: persona.administrador !== null,
    }[rol];
    if (!cumpleRol) throw new HttpError(400, `La persona no esta registrada como ${rol}`);
};

const duplicateError = (error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpError(409, 'Ya existe un usuario con ese email');
    }
    throw error;
};

export const usuarioService = {
    getAll: () => usuarioRepository.findAll(),

    getById: async (idUsuario: number) => {
        const usuario = await usuarioRepository.findById(idUsuario);
        if (!usuario) throw new HttpError(404, 'Usuario no encontrado');
        return usuario;
    },

    create: async (data: CreateUsuarioInput) => {
        const existente = await usuarioRepository.findByUsuario(data.usuario);
        if (existente) throw new HttpError(409, 'Ya existe un usuario con ese nombre');
        await validarPersona(data.personaId, data.rol);

        try {
            return await usuarioRepository.create({
                email: data.email,
                usuario: data.usuario,
                passwordHash: await hashPassword(data.password),
                rol: data.rol,
                persona: {connect: {idPersona: data.personaId}},
            });
        } catch (error) {
            return duplicateError(error);
        }
    },

    update: async (idUsuario: number, data: UpdateUsuarioInput, actorId: number) => {
        const actual = await usuarioService.getById(idUsuario);
        if (actorId === idUsuario && actual.rol === Rol.ADMINISTRADOR && data.activo === false) {
            throw new HttpError(400, 'Un administrador no puede desactivarse a sí mismo');
        }
        if (data.personaId !== undefined || data.rol !== undefined) {
            await validarPersona(data.personaId ?? actual.personaId, data.rol ?? actual.rol, idUsuario);
        }

        const updateData: Prisma.UsuarioUpdateInput = {
            ...(data.email !== undefined ? {email: data.email} : {}),
            ...(data.usuario !== undefined ? {usuario: data.usuario} : {}),
            ...(data.rol !== undefined ? {rol: data.rol} : {}),
            ...(data.activo !== undefined ? {activo: data.activo} : {}),
            ...(data.password !== undefined ? {passwordHash: await hashPassword(data.password)} : {}),
            ...(data.personaId !== undefined ? {persona: {connect: {idPersona: data.personaId}}} : {}),
        };

        try {
            return await usuarioRepository.update(idUsuario, updateData);
        } catch (error) {
            return duplicateError(error);
        }
    },

    remove: async (idUsuario: number, actorId: number) => {
        const actual = await usuarioService.getById(idUsuario);
        if (actorId === idUsuario && actual.rol === Rol.ADMINISTRADOR) {
            throw new HttpError(400, 'Un administrador no puede eliminarse a sí mismo');
        }
        await usuarioRepository.remove(idUsuario);
    },
};
