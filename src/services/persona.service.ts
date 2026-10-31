import { Prisma, Rol } from '@prisma/client';
import * as PersonaRepository from '../repositories/persona.repository';
import { usuarioRepository } from '../repositories/usuario.repository';
import { HttpError } from '../utils/http-error';
import { hashPassword } from '../utils/password';

export const validarDniUnico = async (dni: string, idPersonaActual?: number) => {
  const existente = await PersonaRepository.findByDni(dni);
  if (existente && existente.idPersona !== idPersonaActual) {
    throw new HttpError(409, 'Ya existe una persona con ese DNI');
  }
};

export const validarEmailUnico = async (email: string, idPersonaActual?: number) => {
  const existente = await usuarioRepository.findByEmail(email);
  if (existente && existente.personaId !== idPersonaActual) {
    throw new HttpError(409, 'Ya existe un usuario con ese email');
  }
};

// Toda cuenta nace con los últimos 6 dígitos del DNI y hay que cambiarla en el primer ingreso.
export const nuevaCuenta = async (
  email: string,
  dni: string,
  rol: Rol
): Promise<Prisma.UsuarioCreateWithoutPersonaInput> => ({
  email,
  rol,
  passwordHash: await hashPassword(dni.slice(-6)),
  debeCambiarPassword: true,
});

export const guardarEmail = async (idPersona: number, email: string, dni: string, rol: Rol) => {
  await validarEmailUnico(email, idPersona);
  await usuarioRepository.guardarEmail(idPersona, email, await nuevaCuenta(email, dni, rol));
};
