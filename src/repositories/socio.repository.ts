import { prisma } from "../config/prisma";

export async function findAll() {
    return await prisma.socio.findMany();
}

export async function findById(id: number) {
    return await prisma.socio.findUnique({
        where: {
            idSocio: id
        }
    });
}

export async function create(data: {
    DNI: string;
    apellido: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    fecha_baja?: Date | null;
    fecha_nac: Date;
}) {
    return await prisma.socio.create({
        data: data
    });
}

export async function update(
    id: number,
    data: {
        DNI: string;
        apellido: string;
        nombre: string;
        email: string;
        telefono: string;
        direccion: string;
        fecha_baja?: Date | null;
        fecha_nac: Date;
    }
) {
    return await prisma.socio.update({
        where: {
            idSocio: id
        },
        data: data
    });
}

export async function borrar(id: number) {
    return await prisma.socio.delete({
        where: {
            idSocio: id
        }
    });
}