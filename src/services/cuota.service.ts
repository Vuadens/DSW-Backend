import { cuotaRepository } from '../repositories/cuota.repository';
import { RegistrarCobroInput } from '../schemas/cuota.schema';
import { HttpError } from '../utils/http-error';
import { mesDesdeTexto, primerDiaDelMesActual } from '../utils/fechas';

export function estadoDeCuotas(cuotas: { mesAnio: Date }[], ahora: Date = new Date()) {
    const mesActual = primerDiaDelMesActual(ahora);

    const alDia = cuotas.some((c) => c.mesAnio.getTime() === mesActual.getTime());

    let ultimoMesPagado: Date | null = null;
    for (const c of cuotas) {
        if (!ultimoMesPagado || c.mesAnio.getTime() > ultimoMesPagado.getTime()) {
            ultimoMesPagado = c.mesAnio;
        }
    }

    return {
        estado: alDia ? 'AL_DIA' as const : 'ADEUDA' as const,
        ultimoMesPagado,
    };
}

export const cuotaService = {
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
