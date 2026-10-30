import * as AdministradorRepository from '../repositories/administrador.repository';
import { HttpError } from '../utils/http-error';
import { validarDniUnico } from './persona.service';
import { PersonaInput } from '../schemas/persona.schema';

export const obtenerAdministradores = async () => {
  return AdministradorRepository.obtenerAdministradores();
};

export const obtenerAdministradorPorId = async (id: number) => {
  const administrador = await AdministradorRepository.obtenerAdministradorPorId(id);
  if (!administrador) {
    throw new HttpError(404, 'Administrador no encontrado');
  }
  return administrador;
};

export const crearAdministrador = async (data: PersonaInput) => {
  await validarDniUnico(data.dni);
  return AdministradorRepository.crearAdministrador(data);
};

export const actualizarAdministrador = async (id: number, data: Partial<PersonaInput>) => {
  await obtenerAdministradorPorId(id);
  if (data.dni !== undefined) await validarDniUnico(data.dni, id);
  return AdministradorRepository.actualizarAdministrador(id, data);
};

export const eliminarAdministrador = async (id: number) => {
  await obtenerAdministradorPorId(id);
  return AdministradorRepository.eliminarAdministrador(id);
};
