import * as socioRepository from "../repositories/socio.repository";
import * as PlanRepository from "../repositories/plan.repository";
import { HttpError } from "../utils/http-error";
import { Rol } from '@prisma/client';
import { Actor, esPropietarioSocio } from './authorization.service';
import { hoy, primerDiaDelMesActual } from '../utils/fechas';
import { estadoDeCuotas } from './cuota.service';
import { validarDniUnico } from './persona.service';
import { CreateSocioInput, UpdateSocioInput } from '../schemas/socio.schema';

export async function getAllSocios(actor: Actor) {
  if (actor.rol === Rol.SOCIO) {
    return [await getSocioById(actor.personaId, actor)];
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

export async function createSocio(data: CreateSocioInput) {
  await validarDniUnico(data.dni);
  await validarPlanExistente(data.planId);
  return await socioRepository.create(data);
}

const validarPlanExistente = async (planId: number) => {
  const plan = await PlanRepository.obtenerPlanPorId(planId);
  if (!plan) {
    throw new HttpError(400, "El plan indicado no existe");
  }
};

export async function updateSocio(
  id: number,
  data: UpdateSocioInput,
  actor?: Actor
) {
  await getSocioById(id);
  if (data.dni !== undefined) await validarDniUnico(data.dni, id);
  if (data.planId !== undefined) await validarPlanExistente(data.planId);

  const socioActualizado = await socioRepository.update(id, data);

  // Regla de Negocio: Si se le da de baja lógica al socio,
  // se cancelan automáticamente sus reservas de hoy en adelante
  if (data.fechaBaja !== undefined && data.fechaBaja !== null) {
    await socioRepository.cancelarReservasFuturas(id, hoy());
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
    // El estado de la cuota solo lo ve el administrador.
    return socios.map(({ cuotas, ...socio }) =>
        actor.rol === Rol.ADMINISTRADOR
            ? { ...socio, estadoCuota: cuotas.length > 0 ? 'AL_DIA' : 'ADEUDA' }
            : socio
    );
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