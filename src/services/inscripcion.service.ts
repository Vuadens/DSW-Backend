import { inscripcionRepository } from '../repositories/inscripcion.repository';
import * as socioRepository from '../repositories/socio.repository';
import * as claseRepository from '../repositories/clase.repository';
import { CreateInscripcionInput } from '../schemas/inscripcion.schema';

export const inscripcionService = {
  // 1. Obtener todas las inscripciones activas
  findAll: async () => {
    return await inscripcionRepository.findAll();
  },

  // 2. Obtener inscripción por ID
  findById: async (id: number) => {
    const inscripcion = await inscripcionRepository.findById(id);
    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }
    return inscripcion;
  },

  // 3. Crear inscripción con reglas de negocio
  create: async (data: CreateInscripcionInput) => {
    // Regla 1: Validar existencia del socio y que no tenga fecha_baja
    const socio = await socioRepository.findById(data.idSocio);
    if (!socio) {
      throw new Error('El socio especificado no existe');
    }
    if (socio.fecha_baja !== null) {
      throw new Error('No se puede inscribir a un socio dado de baja');
    }

    // Regla 2: Validar existencia de la clase
    const clase = await claseRepository.obtenerClasePorId(data.idClase);
    if (!clase) {
      throw new Error('La clase especificada no existe');
    }

    // Regla 3: Validar que no esté ya inscripto activamente en esta clase
    const yaInscripto = await inscripcionRepository.findBySocioYClase(data.idSocio, data.idClase);
    if (yaInscripto) {
      throw new Error('El socio ya se encuentra inscripto en esta clase');
    }

    // Regla 4: Validar cupo disponible de la clase
    const cuposOcupados = await inscripcionRepository.countActivasByClase(data.idClase);
    if (cuposOcupados >= clase.cupo) {
      throw new Error('No hay cupos disponibles para esta clase');
    }

    return await inscripcionRepository.create(data);
  },

  // 4. Cancelar inscripción (baja lógica)
  cancelar: async (id: number) => {
    const inscripcion = await inscripcionRepository.findById(id);
    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }
    return await inscripcionRepository.cancelar(id);
  },

  // 5. Eliminar inscripción físicamente
  remove: async (id: number) => {
    const inscripcion = await inscripcionRepository.findById(id);
    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }
    return await inscripcionRepository.remove(id);
  },
};