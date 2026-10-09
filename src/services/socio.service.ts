import * as socioRepository from "../repositories/socio.repository";
import { HttpError } from "../utils/http-error";

export async function getAllSocios() {
  return await socioRepository.findAll();
}

export async function getSocioById(id: number) {
  const socio = await socioRepository.findById(id);
  if (!socio) {
    throw new HttpError(404, "Socio no encontrado");
  }
  return socio;
}

export async function createSocio(data: {
  DNI: string;
  apellido: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_baja?: Date | null;
  fecha_nac: Date;
}) {
  return await socioRepository.create(data);
}

export async function updateSocio(
  id: number,
  data: {
    DNI: string;
    apellido: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    fecha_baja?: Date | null;
    fecha_nac: Date;
  }
) {
  await getSocioById(id);

  const socioActualizado = await socioRepository.update(id, data);

  // Regla de Negocio: Si se le da de baja lógica al socio,
  // se cancelan automáticamente todas sus inscripciones activas
  if (data.fecha_baja !== undefined && data.fecha_baja !== null) {
    await socioRepository.desactivarInscripcionesPorSocio(id);
  }

  return socioActualizado;
}

export async function borrarSocio(id: number) {
  const socio = await getSocioById(id);

  // Si querés evitar un error SQL de Foreign Key al borrar físicamente:
  return await socioRepository.borrar(id);
}