import 'dotenv/config';
import {PrismaClient, Rol} from '@prisma/client';
import {hashPassword} from '../src/utils/password';

const prisma = new PrismaClient();

const main = async () => {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const usuario = process.env.ADMIN_USUARIO || 'admin';
    const dni = process.env.ADMIN_DNI || '00000000';
    if (!email || !password) throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios');

    const existente = await prisma.usuario.findFirst({where: {OR: [{email}, {persona: {dni}}]}});
    if (existente) {
        // Reemplaza el email provisorio que dejó la migración de Usuario.email.
        if (existente.email !== email) {
            await prisma.usuario.update({where: {idUsuario: existente.idUsuario}, data: {email}});
        }
    } else {
        // Todo usuario se vincula a una persona: el admin inicial se crea como Administrador.
        await prisma.usuario.create({
            data: {
                email,
                usuario,
                passwordHash: await hashPassword(password),
                rol: Rol.ADMINISTRADOR,
                persona: {
                    create: {
                        dni,
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
