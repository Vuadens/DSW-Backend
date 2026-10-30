import * as ClaseRepository from '../repositories/clase.repository';
import * as ProfesorRepository from '../repositories/profesor.repository';
import * as ActividadRepository from '../repositories/actividad.repository';
import { inscripcionRepository } from '../repositories/inscripcion.repository';
import { HttpError } from '../utils/http-error';
import { Dia, diaSemanaDe, fechaATexto, hoy, proximaFecha } from '../utils/fechas';
import type { ClaseFiltros, ClaseInput } from '../schemas/clase.schema';

export type CrearClaseData = ClaseInput;
export type ActualizarClaseData = Partial<ClaseInput>;

type ClaseBase = { idClase: number; diaSemana: Dia; cupo: number };

// Agrega a cada clase la fecha consultada (o su próxima fecha desde hoy), los
// inscriptos confirmados en esa fecha y los lugares disponibles.
const conOcupacion = async <T extends ClaseBase>(clases: T[], fecha?: Date) => {
  const desde = hoy();
  const fechas = clases.map((clase) => fecha ?? proximaFecha(clase.diaSemana, desde));
  const grupos = clases.length === 0 ? [] : await inscripcionRepository.contarConfirmadasPorClaseYFecha(
    clases.map((clase) => clase.idClase),
    [...new Set(fechas.map((f) => f.getTime()))].map((t) => new Date(t))
  );
  return clases.map((clase, i) => {
    const inscriptos = grupos.find(
      (g) => g.idClase === clase.idClase && g.fechaClase.getTime() === fechas[i].getTime()
    )?._count._all ?? 0;
    return { ...clase, fecha: fechaATexto(fechas[i]), inscriptos, disponibles: clase.cupo - inscriptos };
  });
};

export const obtenerClases = async ({ fecha, ...filtros }: ClaseFiltros = {}) => {
  // Con fecha, solo las clases que se dictan ese día de la semana.
  const clases = await ClaseRepository.obtenerClases(fecha ? { ...filtros, dia: diaSemanaDe(fecha) } : filtros);
  return conOcupacion(clases, fecha);
};

export const obtenerClasePorId = async (id: number, fecha?: Date) => {
  const clase = await ClaseRepository.obtenerClasePorId(id);
  if (!clase) {
    throw new HttpError(404, 'Clase no encontrada');
  }
  if (fecha && diaSemanaDe(fecha) !== clase.diaSemana) {
    throw new HttpError(400, `La clase se dicta los ${clase.diaSemana}`);
  }
  const [conDatos] = await conOcupacion([clase], fecha);
  return conDatos;
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

  // No se puede bajar el cupo por debajo de los inscriptos de alguna fecha de hoy en adelante.
  if (data.cupo !== undefined) {
    const maxInscriptos = await inscripcionRepository.maxConfirmadasDesde(id, hoy());
    if (data.cupo < maxInscriptos) {
      throw new HttpError(400, `El cupo no puede ser menor a los ${maxInscriptos} inscriptos de una fecha próxima`);
    }
  }
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
