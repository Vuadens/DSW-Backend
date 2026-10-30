import {Prisma, Rol} from '@prisma/client';
import {prisma} from '../config/prisma';

const publicSelect = {
    idUsuario: true,
    usuario: true,
    rol: true,
    activo: true,
    createdAt: true,
    updatedAt: true,
    personaId: true,
} satisfies Prisma.UsuarioSelect;

export const usuarioRepository = {
    findAll: () => prisma.usuario.findMany({select: publicSelect}),

    findById: (idUsuario: number) =>
        prisma.usuario.findUnique({where: {idUsuario}, select: publicSelect}),

    findByUsuario: (usuario: string) =>
        prisma.usuario.findUnique({
            where: {usuario},
            select: {...publicSelect, passwordHash: true},
        }),

    create: (data: Prisma.UsuarioCreateInput) =>
        prisma.usuario.create({data, select: publicSelect}),

    update: (idUsuario: number, data: Prisma.UsuarioUpdateInput) =>
        prisma.usuario.update({where: {idUsuario}, data, select: publicSelect}),

    remove: (idUsuario: number) => prisma.usuario.delete({where: {idUsuario}}),
};
