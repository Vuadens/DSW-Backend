import { prisma } from '../config/prisma';
import { inscripcionRepository } from '../repositories/inscripcion.repository';
import { CreateInscripcionInput } from '../schemas/inscripcion.schema';

export const inscripcionService = {
    findAll: async () => {
    return await inscripcionRepository.findAll();
  },

  findById: async (idInscripcion: number) => {
    const inscripcion = await inscripcionRepository.findById(idInscripcion);
    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }
    return inscripcion;
  },

  create: async (data: CreateInscripcionInput) => {

    const socio = await prisma.socio.findUnique({
      where: { idSocio: data.idSocio },
    });
    if (!socio) {
      throw new Error('El socio especificado no existe');
    }
    if (socio.fecha_baja !== null) {
      throw new Error('El socio se encuentra dado de baja y no puede inscribirse');
    }


    const clase = await prisma.clase.findUnique({
      where: { idClase: data.idClase },
    });
    if (!clase) {
      throw new Error('La clase especificada no existe');
    }

    
    const inscripcionPrevia = await inscripcionRepository.findBySocioYClase(        //Valida que el socio no este inscripto previamente en esta clase
      data.idSocio,
      data.idClase
    );
    if (inscripcionPrevia) {
      throw new Error('El socio ya posee una inscripción activa en esta clase');
    }


    const inscriptosActuales = await inscripcionRepository.countActivasByClase(data.idClase);
    if (inscriptosActuales >= clase.cupo) {
      throw new Error('No hay cupo disponible para esta clase');
    }

    return await inscripcionRepository.create(data);
  },


  cancelar: async (idInscripcion: number) => {
    const inscripcion = await inscripcionRepository.findById(idInscripcion);
    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }

    return await inscripcionRepository.cancelar(idInscripcion);
  },


  remove: async (idInscripcion: number) => {
    const inscripcion = await inscripcionRepository.findById(idInscripcion);
    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }

    return await inscripcionRepository.remove(idInscripcion);
  },
};