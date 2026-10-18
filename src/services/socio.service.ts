import * as socioRepository from "../repositories/socio.repository";
import { HttpError } from "../utils/http-error";
import { Rol } from '@prisma/client';
import { Actor, esPropietarioSocio } from './authorization.service';

export async function getAllSocios(actor: Actor) {
  if (actor.rol === Rol.SOCIO) {
    if (actor.socioId === undefined) throw new HttpError(403, "No puede acceder a socios");
    return [await getSocioById(actor.socioId, actor)];
  }
  return await socioRepository.findAll();
}

export async function getSocioById(id: number, actor?: Actor) {
  if (actor && actor.rol === Rol.SOCIO && !esPropietarioSocio(actor, id)) {
    throw new HttpError(403, "No puede acceder a este socio");
  }
  const socio = await socioRepository.findById(id);
  if (!socio) {
    throw new HttpError(404, "Socio no encontrado");
  }
  return socio;
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
  },
  actor?: Actor
) {
  await getSocioById(id);

  const socioActualizado = await socioRepository.update(id, data);

  // Regla de Negocio: Si se le da de baja lógica al socio,
  // se cancelan automáticamente todas sus inscripciones activas
  if (data.fecha_baja !== undefined && data.fecha_baja !== null) {
    await socioRepository.desactivarInscripcionesPorSocio(id);
  }

  return socioActualizado;
}

export async function borrarSocio(id: number, actor?: Actor) {
    await getSocioById(id, actor);
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