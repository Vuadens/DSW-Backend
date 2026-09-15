import * as socioRepository from "../repositories/socio.repository";

export async function getAllSocios() {
    return await socioRepository.findAll();
}

export async function getSocioById(id: number) {
    return await socioRepository.findById(id);
}

export async function createSocio(data: {
    DNI: string;
    apellido: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    fecha_baja?: Date | null;
    fecha_nac: Date;
}) {
    return await socioRepository.create(data);
}

export async function updateSocio(
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
    return await socioRepository.update(id, data);
}

export async function borrarSocio(id: number) {
    return await socioRepository.borrar(id);
}