import { Rol } from '@prisma/client';
import { cuotaRepository } from '../repositories/cuota.repository';
import { RegistrarCobroInput } from '../schemas/cuota.schema';
import { HttpError } from '../utils/http-error';
import { hoy, mesDesdeTexto, primerDiaDelMesActual } from '../utils/fechas';
import { Actor } from './authorization.service';

// La cuota de cada mes vence ese día del mes; desde el día siguiente queda en mora.
export const DIA_VENCIMIENTO = 10;

export type EstadoCuotas = 'AL_DIA' | 'PENDIENTE' | 'EN_MORA';

const sumarMeses = (mes: Date, meses: number) =>
    new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth() + meses, 1));

export const vencimientoDe = (mes: Date) =>
    new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth(), DIA_VENCIMIENTO));

// Si el socio se da de alta después del vencimiento, su primera cuota es la del mes siguiente.
export const primerMesAdeudado = (fechaAlta: Date) => {
    const alta = hoy(fechaAlta);
    const mesAlta = primerDiaDelMesActual(fechaAlta);
    return alta.getUTCDate() > DIA_VENCIMIENTO ? sumarMeses(mesAlta, 1) : mesAlta;
};

type SocioConCuotas = { fechaAlta: Date; fechaBaja?: Date | null; cuotas: { mesAnio: Date }[] };

// Meses sin pagar desde el primer mes adeudado hasta el mes actual (o el de la baja).
export function mesesImpagos({ fechaAlta, fechaBaja, cuotas }: SocioConCuotas, ahora: Date = new Date()) {
    const hasta = primerDiaDelMesActual(fechaBaja && fechaBaja < ahora ? fechaBaja : ahora);
    const pagados = new Set(cuotas.map((c) => c.mesAnio.getTime()));
    const impagos: Date[] = [];
    for (let mes = primerMesAdeudado(fechaAlta); mes <= hasta; mes = sumarMeses(mes, 1)) {
        if (!pagados.has(mes.getTime())) impagos.push(mes);
    }
    return impagos;
}

// Al día: no debe nada. Pendiente: debe solo meses que todavía no vencieron. En mora: debe un mes vencido.
export function estadoDeCuotas(socio: SocioConCuotas, ahora: Date = new Date()) {
    const impagos = mesesImpagos(socio, ahora);
    const hoyAr = hoy(ahora);
    const enMora = impagos.filter((mes) => hoyAr > vencimientoDe(mes));

    let ultimoMesPagado: Date | null = null;
    for (const c of socio.cuotas) {
        if (!ultimoMesPagado || c.mesAnio.getTime() > ultimoMesPagado.getTime()) {
            ultimoMesPagado = c.mesAnio;
        }
    }

    const estado: EstadoCuotas = enMora.length > 0 ? 'EN_MORA' : impagos.length > 0 ? 'PENDIENTE' : 'AL_DIA';
    return { estado, ultimoMesPagado, mesesEnMora: enMora };
}

export const cuotaService = {
    // El administrador ve todas las cuotas; el socio, solo las propias.
    listar: (actor: Actor) =>
        cuotaRepository.findAll(actor.rol === Rol.SOCIO ? actor.personaId : undefined),

    registrarCobro: async ({ socioId, mes }: RegistrarCobroInput) => {
        const socio = await cuotaRepository.findSocioConPlan(socioId);

        if (!socio) {
            throw new HttpError(404, 'Socio no encontrado');
        }

        if (socio.fechaBaja !== null) {
            throw new HttpError(409, 'El socio está dado de baja');
        }

        const mesAnio = mes ? mesDesdeTexto(mes) : primerDiaDelMesActual();
        const mesActual = primerDiaDelMesActual();

        if (mesAnio.getTime() > mesActual.getTime()) {
            throw new HttpError(400, 'No se puede cobrar un mes futuro');
        }

        const existente = await cuotaRepository.findByMes(socioId, mesAnio);
        if (existente) {
            throw new HttpError(409, 'La cuota de ese mes ya fue cobrada');
        }

        return cuotaRepository.create({
            socioId,
            mesAnio,
            valor: socio.plan.precio,
        });
    },
};
