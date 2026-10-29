import * as socioRepository from "../repositories/socio.repository";
import * as PlanRepository from "../repositories/plan.repository";
import { HttpError } from "../utils/http-error";
import { Rol } from '@prisma/client';
import { Actor, esPropietarioSocio } from './authorization.service';
import { primerDiaDelMesActual } from '../utils/fechas';
import { estadoDeCuotas } from './cuota.service';

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
    telefono: string;
    fecha_baja?: Date | null;
    fecha_nac: Date;
    planId: number;
}) {
  await validarDniUnico(data.DNI);
  await validarPlanExistente(data.planId);
  return await socioRepository.create(data);
}

const validarDniUnico = async (DNI: string, idSocioActual?: number) => {
  const existente = await socioRepository.findByDNI(DNI);
  if (existente && existente.idSocio !== idSocioActual) {
    throw new HttpError(409, "Ya existe un socio con ese DNI");
  }
};

const validarPlanExistente = async (planId: number) => {
  const plan = await PlanRepository.obtenerPlanPorId(planId);
  if (!plan) {
    throw new HttpError(400, "El plan indicado no existe");
  }
};

export async function updateSocio(
  id: number,
  data: {
    DNI: string;
    apellido: string;
    nombre: string;
    telefono: string;
    fecha_baja?: Date | null;
    fecha_nac: Date;
    planId: number;
  },
  actor?: Actor
) {
  await getSocioById(id);
  if (data.DNI !== undefined) await validarDniUnico(data.DNI, id);
  if (data.planId !== undefined) await validarPlanExistente(data.planId);

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

export async function getSociosByPlan(planId: number, actor: Actor) {
    // El listado por plan expone datos de otros socios: un SOCIO no puede verlo.
    if (actor.rol === Rol.SOCIO) {
        throw new HttpError(403, "No puede acceder al listado de socios por plan");
    }
    const socios = await socioRepository.findAllByPlan(planId, primerDiaDelMesActual());
    return socios.map(({ cuotas, ...socio }) => ({
        ...socio,
        estadoCuota: cuotas.length > 0 ? 'AL_DIA' : 'ADEUDA',
    }));
}

export async function getSocioDetalle(id: number, actor?: Actor) {
    if (actor && actor.rol === Rol.SOCIO && !esPropietarioSocio(actor, id)) {
        throw new HttpError(403, "No puede acceder a este socio");
    }

    const socio = await socioRepository.findByIdConDetalle(id);
    if (!socio) {
        throw new HttpError(404, "Socio no encontrado");
    }

    const { cuotas, plan, ...resto } = socio;

    return {
        ...resto,
        plan,
        cuotas,
        estadoCuotas: estadoDeCuotas(cuotas),
    };
}