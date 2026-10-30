import { inscripcionRepository } from '../repositories/inscripcion.repository';
import * as socioRepository from '../repositories/socio.repository';
import * as claseRepository from '../repositories/clase.repository';
import { CreateInscripcionInput, InscripcionFiltros } from '../schemas/inscripcion.schema';
import { EstadoInscripcion, Rol } from '@prisma/client';
import { Actor } from './authorization.service';
import { HttpError } from '../utils/http-error';
import { diaSemanaDe, finDelDia, hoy, inicioDeClase, primerDiaDelMesActual, sumarDias } from '../utils/fechas';

// Se puede reservar desde hoy hasta esta cantidad de días adelante.
export const VENTANA_RESERVA_DIAS = 7;

type InscripcionConClase = NonNullable<Awaited<ReturnType<typeof inscripcionRepository.findById>>>;

// El profesor solo opera sobre las clases que dicta.
const validarProfesorDeLaClase = (actor: Actor, idProfesorClase: number) => {
  if (actor.rol === Rol.PROFESOR && actor.personaId !== idProfesorClase) {
    throw new HttpError(403, 'Solo puede operar sobre las clases que dicta');
  }
};

export const inscripcionService = {
  // 1. Obtener las inscripciones (el socio solo ve las propias)
  findAll: async (filtros: InscripcionFiltros, actor: Actor) => {
    if (actor.rol === Rol.SOCIO) {
      return inscripcionRepository.findAll({ ...filtros, idSocio: actor.personaId });
    }
    return inscripcionRepository.findAll(filtros);
  },

  // 2. Obtener inscripción por ID
  findById: async (id: number, actor?: Actor): Promise<InscripcionConClase> => {
    const inscripcion = await inscripcionRepository.findById(id);
    if (!inscripcion) {
      throw new HttpError(404, 'Inscripción no encontrada');
    }
    if (actor?.rol === Rol.SOCIO && actor.personaId !== inscripcion.idSocio) {
      throw new HttpError(403, 'No puede acceder a esta inscripcion');
    }
    return inscripcion;
  },

  // 3. Reservar una clase para una fecha, con las reglas de negocio de la reserva
  create: async (data: CreateInscripcionInput, actor: Actor) => {
    if (actor.rol === Rol.SOCIO && actor.personaId !== data.idSocio) {
      throw new HttpError(403, 'Solo puede inscribirse como socio propio');
    }

    // Regla 1: el socio existe y no está dado de baja
    const socio = await socioRepository.findParaReserva(data.idSocio, primerDiaDelMesActual());
    if (!socio) {
      throw new HttpError(400, 'El socio especificado no existe');
    }
    if (socio.fechaBaja !== null) {
      throw new HttpError(400, 'No se puede inscribir a un socio dado de baja');
    }

    // Regla 2: la clase existe (y el profesor solo inscribe en las que dicta)
    const clase = await claseRepository.obtenerClasePorId(data.idClase);
    if (!clase) {
      throw new HttpError(400, 'La clase especificada no existe');
    }
    validarProfesorDeLaClase(actor, clase.idProfesor);

    // Regla 3: la fecha cae en el día de la clase, dentro de la ventana de reserva, y la clase no empezó
    if (diaSemanaDe(data.fechaClase) !== clase.diaSemana) {
      throw new HttpError(400, `La clase se dicta los ${clase.diaSemana}`);
    }
    const desde = hoy();
    if (data.fechaClase < desde || data.fechaClase > sumarDias(desde, VENTANA_RESERVA_DIAS)) {
      throw new HttpError(400, `Solo se puede reservar desde hoy hasta ${VENTANA_RESERVA_DIAS} días adelante`);
    }
    if (inicioDeClase(data.fechaClase, clase.horaDesde) <= new Date()) {
      throw new HttpError(400, 'La clase ya comenzó');
    }

    // Regla 4: no tiene otra reserva confirmada para esa clase y fecha
    const existente = await inscripcionRepository.findBySocioClaseYFecha(data.idSocio, data.idClase, data.fechaClase);
    if (existente?.estado === EstadoInscripcion.CONFIRMADA) {
      throw new HttpError(400, 'El socio ya se encuentra inscripto en esta clase');
    }

    // Regla 5: hay cupo en esa fecha
    const cuposOcupados = await inscripcionRepository.countConfirmadas(data.idClase, data.fechaClase);
    if (cuposOcupados >= clase.cupo) {
      throw new HttpError(400, 'No hay cupos disponibles para esta clase');
    }

    // Regla 6: el plan del socio incluye la actividad
    if (!socio.plan.actividades.some((a) => a.id === clase.idActividad)) {
      throw new HttpError(400, 'El plan del socio no incluye esta actividad');
    }

    // Regla 7: pagó la cuota del mes actual
    if (socio.cuotas.length === 0) {
      throw new HttpError(400, 'El socio adeuda la cuota del mes');
    }

    // Si tenía una reserva cancelada se reactiva: el unique (idSocio, idClase, fechaClase) impide crear otra.
    if (existente) {
      return await inscripcionRepository.reactivar(existente.idInscripcion);
    }
    return await inscripcionRepository.create(data);
  },

  // 4. Cancelar inscripción (baja lógica), hasta que empieza la clase
  cancelar: async (id: number, actor: Actor) => {
    const inscripcion = await inscripcionService.findById(id, actor);
    validarProfesorDeLaClase(actor, inscripcion.clase.idProfesor);
    if (inscripcion.estado !== EstadoInscripcion.CONFIRMADA) {
      throw new HttpError(400, 'La inscripción ya está cancelada');
    }
    if (inicioDeClase(inscripcion.fechaClase, inscripcion.clase.horaDesde) <= new Date()) {
      throw new HttpError(400, 'No se puede cancelar una clase que ya comenzó');
    }
    return await inscripcionRepository.cancelar(id);
  },

  // 5. Registrar asistencia: desde que empieza la clase hasta el fin de ese día
  registrarAsistencia: async (id: number, asistio: boolean, actor: Actor) => {
    const inscripcion = await inscripcionService.findById(id, actor);
    validarProfesorDeLaClase(actor, inscripcion.clase.idProfesor);
    if (inscripcion.estado !== EstadoInscripcion.CONFIRMADA) {
      throw new HttpError(400, 'No se puede registrar asistencia de una inscripción cancelada');
    }
    const ahora = new Date();
    if (ahora < inicioDeClase(inscripcion.fechaClase, inscripcion.clase.horaDesde)) {
      throw new HttpError(400, 'La clase todavía no comenzó');
    }
    if (ahora >= finDelDia(inscripcion.fechaClase)) {
      throw new HttpError(400, 'La asistencia solo se registra el mismo día de la clase');
    }
    return await inscripcionRepository.registrarAsistencia(id, asistio);
  },

  // 6. Eliminar inscripción físicamente (solo admin, controlado en la ruta)
  remove: async (id: number) => {
    await inscripcionService.findById(id);
    return await inscripcionRepository.remove(id);
  },
};
