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
        // Todo usuario se vincula a una persona: el admin inicial se crea como Administrador.
        await prisma.usuario.create({
            data: {
                usuario,
                passwordHash: await hashPassword(password),
                rol: Rol.ADMINISTRADOR,
                persona: {
                    create: {
                        dni: process.env.ADMIN_DNI || '00000000',
                        nombre: usuario,
                        apellido: '',
                        telefono: '',
                        fechaNac: new Date('1900-01-01'),
                        administrador: {create: {}},
                    },
                },
            },
        });
    }
};

main().finally(() => prisma.$disconnect());
