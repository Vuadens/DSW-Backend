import {Prisma, Rol} from '@prisma/client';
import {usuarioRepository} from '../repositories/usuario.repository';
import {CreateUsuarioInput, UpdateUsuarioInput} from '../schemas/usuario.schema';
import {hashPassword} from '../utils/password';
import {HttpError} from '../utils/http-error';
import {prisma} from '../config/prisma';

const duplicateError = (error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpError(409, 'Ya existe un usuario con ese nombre');
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
        if (data.socioId !== undefined) {
            const socio = await prisma.socio.findUnique({where: {idSocio: data.socioId}, select: {idSocio: true, usuario: true}});
            if (!socio) throw new HttpError(404, 'Socio no encontrado');
            if (socio.usuario) throw new HttpError(409, 'El socio ya esta vinculado a otro usuario');
        }
        if (data.profesorId !== undefined) {
            const profesor = await prisma.profesor.findUnique({where: {idProfesor: data.profesorId}, select: {idProfesor: true, usuario: true}});
            if (!profesor) throw new HttpError(404, 'Profesor no encontrado');
            if (profesor.usuario) throw new HttpError(409, 'El profesor ya esta vinculado a otro usuario');
        }

        try {
            return await usuarioRepository.create({
                usuario: data.usuario,
                passwordHash: await hashPassword(data.password),
                rol: data.rol,
                ...(data.socioId !== undefined ? {socio: {connect: {idSocio: data.socioId}}} : {}),
                ...(data.profesorId !== undefined ? {profesor: {connect: {idProfesor: data.profesorId}}} : {}),
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
        if (data.socioId !== undefined) {
            const socio = await prisma.socio.findUnique({where: {idSocio: data.socioId}, select: {idSocio: true, usuario: true}});
            if (!socio) throw new HttpError(404, 'Socio no encontrado');
            if (socio.usuario && socio.usuario.idUsuario !== idUsuario) {
                throw new HttpError(409, 'El socio ya esta vinculado a otro usuario');
            }
        }
        if (data.profesorId !== undefined) {
            const profesor = await prisma.profesor.findUnique({where: {idProfesor: data.profesorId}, select: {idProfesor: true, usuario: true}});
            if (!profesor) throw new HttpError(404, 'Profesor no encontrado');
            if (profesor.usuario && profesor.usuario.idUsuario !== idUsuario) {
                throw new HttpError(409, 'El profesor ya esta vinculado a otro usuario');
            }
        }

        const updateData: Prisma.UsuarioUpdateInput = {
            ...(data.usuario !== undefined ? {usuario: data.usuario} : {}),
            ...(data.rol !== undefined ? {rol: data.rol} : {}),
            ...(data.activo !== undefined ? {activo: data.activo} : {}),
            ...(data.password !== undefined ? {passwordHash: await hashPassword(data.password)} : {}),
            ...(data.socioId !== undefined ? {socio: {connect: {idSocio: data.socioId}}} : {}),
            ...(data.profesorId !== undefined ? {profesor: {connect: {idProfesor: data.profesorId}}} : {}),
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
