import { inscripcionRepository } from '../repositories/inscripcion.repository';
import * as socioRepository from '../repositories/socio.repository';
import * as claseRepository from '../repositories/clase.repository';
import { CreateInscripcionInput } from '../schemas/inscripcion.schema';
import { Rol } from '@prisma/client';
import { Actor } from './authorization.service';
import { HttpError } from '../utils/http-error';

export const inscripcionService = {
  // 1. Obtener todas las inscripciones activas
  findAll: async (actor: Actor) => {
    const inscripciones = await inscripcionRepository.findAll();
    if (actor.rol === Rol.SOCIO) {
      return inscripciones.filter((item) => item.idSocio === actor.personaId);
    }
    return inscripciones;
  },

  // 2. Obtener inscripción por ID
  findById: async (id: number, actor?: Actor) => {
    const inscripcion = await inscripcionRepository.findById(id);
    if (!inscripcion) {
      throw new HttpError(404, 'Inscripción no encontrada');
    }
    if (actor?.rol === Rol.SOCIO && actor.personaId !== inscripcion.idSocio) {
      throw new HttpError(403, 'No puede acceder a esta inscripcion');
    }
    return inscripcion;
  },

  // 3. Crear inscripción con reglas de negocio
  create: async (data: CreateInscripcionInput, actor: Actor) => {
    if (actor.rol === Rol.SOCIO && actor.personaId !== data.idSocio) {
      throw new HttpError(403, 'Solo puede inscribirse como socio propio');
    }
    // Regla 1: Validar existencia del socio y que no tenga fechaBaja
    const socio = await socioRepository.findById(data.idSocio);
    if (!socio) {
      throw new HttpError(400, 'El socio especificado no existe');
    }
    if (socio.fechaBaja !== null) {
      throw new HttpError(400, 'No se puede inscribir a un socio dado de baja');
    }

    // Regla 2: Validar existencia de la clase
    const clase = await claseRepository.obtenerClasePorId(data.idClase);
    if (!clase) {
      throw new HttpError(400, 'La clase especificada no existe');
    }

    // Regla 3: Validar que no esté ya inscripto activamente en esta clase
    const existente = await inscripcionRepository.findBySocioYClase(data.idSocio, data.idClase);
    if (existente?.activo) {
      throw new HttpError(400, 'El socio ya se encuentra inscripto en esta clase');
    }

    // Regla 4: Validar cupo disponible de la clase
    const cuposOcupados = await inscripcionRepository.countActivasByClase(data.idClase);
    if (cuposOcupados >= clase.cupo) {
      throw new HttpError(400, 'No hay cupos disponibles para esta clase');
    }

    // Si tenía una inscripción cancelada se reactiva: el unique (idSocio, idClase) impide crear otra.
    if (existente) {
      return await inscripcionRepository.reactivar(existente.idInscripcion);
    }
    return await inscripcionRepository.create(data);
  },

  // 4. Cancelar inscripción (baja lógica)
  cancelar: async (id: number, actor: Actor) => {
    await inscripcionService.findById(id, actor);
    return await inscripcionRepository.cancelar(id);
  },

  // 5. Eliminar inscripción físicamente
  remove: async (id: number, actor: Actor) => {
    await inscripcionService.findById(id, actor);
    return await inscripcionRepository.remove(id);
  },
};