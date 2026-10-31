import { Rol } from '@prisma/client';
import * as AdministradorRepository from '../repositories/administrador.repository';
import { HttpError } from '../utils/http-error';
import { guardarEmail, nuevaCuenta, validarDniUnico, validarEmailUnico } from './persona.service';
import { AdministradorInput } from '../schemas/administrador.schema';

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

export const crearAdministrador = async ({ email, ...data }: AdministradorInput) => {
  await validarDniUnico(data.dni);
  await validarEmailUnico(email);
  return AdministradorRepository.crearAdministrador(data, await nuevaCuenta(email, data.dni, Rol.ADMINISTRADOR));
};

export const actualizarAdministrador = async (id: number, { email, ...data }: Partial<AdministradorInput>) => {
  const administrador = await obtenerAdministradorPorId(id);
  if (data.dni !== undefined) await validarDniUnico(data.dni, id);
  if (email !== undefined) await guardarEmail(id, email, data.dni ?? administrador.persona.dni, Rol.ADMINISTRADOR);
  return AdministradorRepository.actualizarAdministrador(id, data);
};

export const eliminarAdministrador = async (id: number) => {
  await obtenerAdministradorPorId(id);
  return AdministradorRepository.eliminarAdministrador(id);
};
