import { EstadoInscripcion } from "@prisma/client";
import { prisma } from "../config/prisma";
import { PersonaInput } from "../schemas/persona.schema";
import { CreateSocioInput, UpdateSocioInput } from "../schemas/socio.schema";
import * as PersonaRepository from "./persona.repository";

const incluir = { persona: true } as const;

export async function findAll() {
    return await prisma.socio.findMany({ include: incluir });
}

export async function findById(id: number) {
    return await prisma.socio.findUnique({
        where: {
            idPersona: id
        },
        include: incluir
    });
}

export async function create(data: CreateSocioInput) {
    const { persona, resto: { planId, ...resto } } = PersonaRepository.separarPersona(data);
    return await prisma.socio.create({
        data: {
            ...resto,
            plan: { connect: { idPlan: planId } },
            persona: { create: persona as PersonaInput }
        },
        include: incluir
    });
}

export async function update(id: number, data: UpdateSocioInput) {
    const { persona, resto: { planId, ...resto } } = PersonaRepository.separarPersona(data);
    return await prisma.socio.update({
        where: {
            idPersona: id
        },
        data: {
            ...resto,
            ...(planId !== undefined ? { plan: { connect: { idPlan: planId } } } : {}),
            ...(Object.keys(persona).length > 0 ? { persona: { update: persona } } : {})
        },
        include: incluir
    });
}

export async function borrar(id: number) {
    const [socio] = await prisma.$transaction([
        prisma.socio.delete({
            where: {
                idPersona: id
            }
        }),
        PersonaRepository.eliminarSiNoTieneRoles(id)
    ]);
    return socio;
}

// Cancela las reservas confirmadas desde `desde` en adelante.
export async function cancelarReservasFuturas(idSocio: number, desde: Date) {
  return await prisma.inscripcion.updateMany({
    where: {
      idSocio: idSocio,
      estado: EstadoInscripcion.CONFIRMADA,
      fechaClase: { gte: desde },
    },
    data: {
      estado: EstadoInscripcion.CANCELADA,
    },
  });
}

// Lo necesario para validar una reserva: actividades del plan y cuota del mes.
export async function findParaReserva(id: number, mesActual: Date) {
    return await prisma.socio.findUnique({
        where: { idPersona: id },
        select: {
            fechaBaja: true,
            plan: { select: { actividades: { select: { id: true } } } },
            cuotas: { where: { mesAnio: mesActual }, select: { idCuota: true } },
        },
    });
}

export async function findAllByPlan(planId: number, mesActual: Date) {
    return await prisma.socio.findMany({
        where: { planId },
        select: {
            idPersona: true,
            persona: { select: { dni: true, nombre: true, apellido: true } },
            cuotas: { where: { mesAnio: mesActual }, select: { idCuota: true } },
        },
    });
}

export async function findByIdConDetalle(id: number) {
    return await prisma.socio.findUnique({
        where: { idPersona: id },
        include: {
            persona: true,
            plan: true,
            cuotas: { orderBy: { mesAnio: 'desc' } },
        },
    });
}
