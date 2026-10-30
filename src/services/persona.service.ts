import * as PersonaRepository from '../repositories/persona.repository';
import { HttpError } from '../utils/http-error';

export const validarDniUnico = async (dni: string, idPersonaActual?: number) => {
  const existente = await PersonaRepository.findByDni(dni);
  if (existente && existente.idPersona !== idPersonaActual) {
    throw new HttpError(409, 'Ya existe una persona con ese DNI');
  }
};
