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
    planId: number;
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
        planId: number;
    }
) {
    return await socioRepository.update(id, data);
}

export async function borrarSocio(id: number) {
    return await socioRepository.borrar(id);
}

export async function getSociosByPlan(planId: number) {
    return await socioRepository.findAllByPlan(planId);
}

function calcularEstadoCuota(cuotas: { mesAnio: Date; fechaPago: Date | null }[]) {
    const ahora = new Date();
    const cuotaDelMes = cuotas.find(
        (c) => c.mesAnio.getFullYear() === ahora.getFullYear() && c.mesAnio.getMonth() === ahora.getMonth()
    );

    if (!cuotaDelMes) return "Sin cuota generada este mes";
    return cuotaDelMes.fechaPago ? "Al día" : "Atrasado";
}

export async function getSocioDetalle(id: number) {
    const socio = await socioRepository.findByIdConDetalle(id);
    if (!socio) return null;

    return {
        idSocio: socio.idSocio,
        DNI: socio.DNI,
        nombre: socio.nombre,
        apellido: socio.apellido,
        email: socio.email,
        telefono: socio.telefono,
        direccion: socio.direccion,
        plan: socio.plan,
        estadoCuota: calcularEstadoCuota(socio.cuotas),
    };
}