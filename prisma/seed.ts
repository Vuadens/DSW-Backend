import 'dotenv/config';
import {PrismaClient, Rol} from '@prisma/client';
import {hashPassword} from '../src/utils/password';

const prisma = new PrismaClient();

const main = async () => {
    const usuario = process.env.ADMIN_USUARIO;
    const password = process.env.ADMIN_PASSWORD;
    if (!usuario || !password) throw new Error('ADMIN_USUARIO y ADMIN_PASSWORD son obligatorios');

    const existente = await prisma.usuario.findUnique({where: {usuario}});
    if (!existente) {
        await prisma.usuario.create({
            data: {usuario, passwordHash: await hashPassword(password), rol: Rol.ADMINISTRADOR},
        });
    }
};

main().finally(() => prisma.$disconnect());
