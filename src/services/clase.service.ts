import * as ClaseRepository from '../repositories/clase.repository';
import * as ProfesorRepository from '../repositories/profesor.repository';
import * as ActividadRepository from '../repositories/actividad.repository';
import { HttpError } from '../utils/http-error';
import type { ClaseFiltros, ClaseInput } from './schemas/clase.schema';

export type CrearClaseData = ClaseInput;
export type ActualizarClaseData = Partial<ClaseInput>;

export const obtenerClases = async (filtros: ClaseFiltros = {}) => {
  return ClaseRepository.obtenerClases(filtros);
};

export const obtenerClasePorId = async (id: number) => {
  const clase = await ClaseRepository.obtenerClasePorId(id);
  if (!clase) {
    throw new HttpError(404, 'Clase no encontrada');
  }
  return clase;
};

export const crearClase = async (data: CrearClaseData) => {
  await validarReglas(data);
  return ClaseRepository.crearClase(data);
};

export const actualizarClase = async (id: number, data: ActualizarClaseData) => {
  const existente = await obtenerClasePorId(id);

  // Con PATCH pueden venir solo algunos campos: validamos sobre el resultado final.
  const resultado: CrearClaseData = {
    diaSemana: data.diaSemana ?? existente.diaSemana,
    horaDesde: data.horaDesde ?? existente.horaDesde,
    horaHasta: data.horaHasta ?? existente.horaHasta,
    cupo: data.cupo ?? existente.cupo,
    idActividad: data.idActividad ?? existente.idActividad,
    idProfesor: data.idProfesor ?? existente.idProfesor
  };

  // TODO (cuando exista Inscripcion): rechazar si data.cupo < cantidad de inscriptos actuales.
  await validarReglas(resultado, id);
  return ClaseRepository.actualizarClase(id, data);
};

export const eliminarClase = async (id: number) => {
  await obtenerClasePorId(id);
  // Si la clase tiene inscripciones, la FK hace fallar el delete (P2003)
  // y error.middleware lo traduce a 409 para evitar borrar en cascada muchos registros de las tablas que dependen de ella.
  return ClaseRepository.eliminarClase(id);
};

// ---- reglas de negocio (crear y actualizar) ----

const validarReglas = async (data: CrearClaseData, idClaseActual?: number) => {
  if (data.horaHasta <= data.horaDesde) {
    throw new HttpError(400, 'La hora de fin debe ser posterior a la hora de inicio');
  }

  const actividad = await ActividadRepository.actividadRepository.findById(data.idActividad);
  if (!actividad) {
    throw new HttpError(400, 'La actividad indicada no existe');
  }

  const profesor = await ProfesorRepository.obtenerProfesorPorId(data.idProfesor);
  if (!profesor) {
    throw new HttpError(400, 'El profesor indicado no existe');
  }

  // Un profesor no puede dictar dos clases al mismo tiempo.
  // "HH:mm" en 24 hs se compara bien como texto, manejo si fuera de tipo "Date" se vuelve mucho mas engorroso.
  const delMismoDia = await ClaseRepository.obtenerClasesDeProfesorEnDia(
    data.idProfesor,
    data.diaSemana,
    idClaseActual
  );
  const seSuperpone = delMismoDia.some(
    (otra: { horaDesde: string; horaHasta: string }) => data.horaDesde < otra.horaHasta && data.horaHasta > otra.horaDesde
  );
  if (seSuperpone) {
    throw new HttpError(409, 'El profesor ya tiene una clase en ese día y horario');
  }
};
