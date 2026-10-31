import {Prisma} from '@prisma/client';
import {prisma} from '../config/prisma';

const publicSelect = {
    idUsuario: true,
    email: true,
    usuario: true,
    rol: true,
    debeCambiarPassword: true,
    activo: true,
    createdAt: true,
    updatedAt: true,
    personaId: true,
} satisfies Prisma.UsuarioSelect;

export const usuarioRepository = {
    findAll: () => prisma.usuario.findMany({select: publicSelect}),

    findById: (idUsuario: number) =>
        prisma.usuario.findUnique({where: {idUsuario}, select: publicSelect}),

    findConPassword: (idUsuario: number) =>
        prisma.usuario.findUnique({
            where: {idUsuario},
            select: {...publicSelect, passwordHash: true},
        }),

    findByEmail: (email: string) =>
        prisma.usuario.findUnique({
            where: {email},
            select: {...publicSelect, passwordHash: true},
        }),

    findByDni: (dni: string) =>
        prisma.usuario.findFirst({
            where: {persona: {dni}},
            select: {...publicSelect, passwordHash: true},
        }),

    findPerfil: (idUsuario: number) =>
        prisma.usuario.findUnique({
            where: {idUsuario},
            select: {
                ...publicSelect,
                persona: {select: {dni: true, nombre: true, apellido: true, telefono: true, fechaNac: true}},
            },
        }),

    create: (data: Prisma.UsuarioCreateInput) =>
        prisma.usuario.create({data, select: publicSelect}),

    update: (idUsuario: number, data: Prisma.UsuarioUpdateInput) =>
        prisma.usuario.update({where: {idUsuario}, data, select: publicSelect}),

    // Actualiza el email de la cuenta de la persona; si no tiene cuenta, se la crea.
    guardarEmail: (personaId: number, email: string, cuenta: Prisma.UsuarioCreateWithoutPersonaInput) =>
        prisma.usuario.upsert({
            where: {personaId},
            update: {email},
            create: {...cuenta, persona: {connect: {idPersona: personaId}}},
        }),

    remove: (idUsuario: number) => prisma.usuario.delete({where: {idUsuario}}),
};
