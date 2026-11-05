import * as socioRepository from "../repositories/socio.repository";
import * as PlanRepository from "../repositories/plan.repository";
import { HttpError } from "../utils/http-error";
import { Rol } from '@prisma/client';
import { Actor, esPropietarioSocio } from './authorization.service';
import { hoy, primerDiaDelMesActual } from '../utils/fechas';
import { estadoDeCuotas } from './cuota.service';
import { guardarEmail, nuevaCuenta, validarDniUnico, validarEmailUnico } from './persona.service';
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

export async function createSocio({ email, ...data }: CreateSocioInput) {
  await validarDniUnico(data.dni);
  await validarEmailUnico(email);
  await validarPlanExistente(data.planId);
  if (data.fechaBaja) validarFechaBaja(data.fechaBaja, data.fechaAlta ?? new Date());
  const cuenta = await nuevaCuenta(email, data.dni, Rol.SOCIO);
  return await socioRepository.create(data, data.fechaBaja ? { ...cuenta, activo: false } : cuenta);
}

const validarPlanExistente = async (planId: number) => {
  const plan = await PlanRepository.obtenerPlanPorId(planId);
  if (!plan) {
    throw new HttpError(400, "El plan indicado no existe");
  }
};

export async function updateSocio(
  id: number,
  { email, ...data }: UpdateSocioInput,
  actor?: Actor
) {
  const socio = await getSocioById(id);
  if (data.dni !== undefined) await validarDniUnico(data.dni, id);
  if (data.planId !== undefined) await validarPlanExistente(data.planId);
  if (data.fechaBaja) validarFechaBaja(data.fechaBaja, data.fechaAlta ?? socio.fechaAlta);
  if (email !== undefined) await guardarEmail(id, email, data.dni ?? socio.persona.dni, Rol.SOCIO);

  const socioActualizado = await socioRepository.update(id, data);

  if (data.fechaBaja) {
    await aplicarBaja(id);
  } else if (data.fechaBaja === null && socio.fechaBaja !== null) {
    // Al quitarle la fecha de baja, el socio recupera el acceso.
    await socioRepository.setCuentaActiva(id, true);
  }

  return socioActualizado;
}

// La baja no puede ser futura ni anterior al alta.
const validarFechaBaja = (fechaBaja: Date, fechaAlta: Date) => {
  if (fechaBaja.getTime() > hoy().getTime()) {
    throw new HttpError(400, "La fecha de baja no puede ser futura");
  }
  if (fechaBaja.getTime() < hoy(fechaAlta).getTime()) {
    throw new HttpError(400, "La fecha de baja no puede ser anterior a la fecha de alta");
  }
};

// Regla de Negocio: el socio dado de baja pierde el acceso al sistema
// y se cancelan sus reservas de hoy en adelante.
const aplicarBaja = async (id: number) => {
  await socioRepository.setCuentaActiva(id, false);
  await socioRepository.cancelarReservasFuturas(id, hoy());
};

// Baja lógica. El socio se da de baja a sí mismo con fecha de hoy;
// el administrador puede indicar una fecha que no sea futura.
export async function darDeBajaSocio(id: number, actor: Actor, fechaBaja?: Date) {
  const socio = await getSocioById(id, actor);
  if (socio.fechaBaja !== null) {
    throw new HttpError(409, "El socio ya está dado de baja");
  }
  const fecha = actor.rol === Rol.ADMINISTRADOR && fechaBaja ? fechaBaja : hoy();
  validarFechaBaja(fecha, socio.fechaAlta);
  const actualizado = await socioRepository.update(id, { fechaBaja: fecha });
  await aplicarBaja(id);
  return actualizado;
}

// Aplica los cambios de plan programados cuyo mes ya empezó.
export const aplicarCambiosDePlan = () => socioRepository.aplicarCambiosDePlan(hoy());

// El socio elige el plan al que se pasa desde el mes siguiente; con null cancela el cambio.
export async function programarCambioDePlan(id: number, planId: number | null, actor: Actor) {
  const socio = await getSocioById(id, actor);
  if (socio.fechaBaja !== null) {
    throw new HttpError(409, "El socio está dado de baja");
  }
  if (planId === null) {
    return await socioRepository.programarCambioDePlan(id, null, null);
  }
  const plan = await PlanRepository.obtenerPlanPorId(planId);
  if (!plan || !plan.activo) {
    throw new HttpError(400, "El plan indicado no existe o no está activo");
  }
  if (plan.idPlan === socio.planId) {
    throw new HttpError(400, "El socio ya tiene ese plan");
  }
  const mesActual = primerDiaDelMesActual();
  const mesSiguiente = new Date(Date.UTC(mesActual.getUTCFullYear(), mesActual.getUTCMonth() + 1, 1));
  return await socioRepository.programarCambioDePlan(id, planId, mesSiguiente);
}

export async function reactivarSocio(id: number) {
  const socio = await getSocioById(id);
  if (socio.fechaBaja === null) {
    throw new HttpError(409, "El socio no está dado de baja");
  }
  const actualizado = await socioRepository.update(id, { fechaBaja: null });
  await socioRepository.setCuentaActiva(id, true);
  return actualizado;
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
    const socios = await socioRepository.findAllByPlan(planId);
    // El estado de la cuota solo lo ve el administrador.
    return socios.map(({ cuotas, fechaAlta, fechaBaja, ...socio }) =>
        actor.rol === Rol.ADMINISTRADOR
            ? { ...socio, estadoCuota: estadoDeCuotas({ fechaAlta, fechaBaja, cuotas }).estado }
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

    if (actor?.rol === Rol.PROFESOR) {
        return {
            ...resto,
            plan,
        };
    }

    return {
        ...resto,
        plan,
        cuotas,
        estadoCuotas: estadoDeCuotas(socio),
    };
}
