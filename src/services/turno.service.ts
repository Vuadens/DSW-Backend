import { turnoRepository } from '../repositories/turno.repository';
import * as profesorRepository from '../repositories/profesor.repository';
import { HttpError } from '../utils/http-error';
import { CreateTurnoInput, UpdateTurnoInput } from '../schemas/turno.schema';

export const turnoService = {
  findAll: async () => {
    return await turnoRepository.findAll();
  },

  findById: async (idTurno: number) => {
    const turno = await turnoRepository.findById(idTurno);
    if (!turno) {
      throw new HttpError(404, 'Turno no encontrado');
    }
    return turno;
  },

  create: async (data: CreateTurnoInput) => {
    const existente = await turnoRepository.findByDiaYHorario(
      data.diaSemana,
      data.horaDesde,
      data.horaHasta
    );
    if (existente) {
      throw new HttpError(409, 'Ya existe un turno registrado en ese mismo día y horario');
    }

    return await turnoRepository.create(data);
  },

  update: async (idTurno: number, data: UpdateTurnoInput) => {
    const turnoExistente = await turnoRepository.findById(idTurno);
    if (!turnoExistente) {
      throw new HttpError(404, 'Turno no encontrado');
    }

    const diaFinal = data.diaSemana ?? turnoExistente.diaSemana;
    const desdeFinal = data.horaDesde ?? turnoExistente.horaDesde;
    const hastaFinal = data.horaHasta ?? turnoExistente.horaHasta;

    if (hastaFinal <= desdeFinal) {
      throw new HttpError(400, 'horaHasta debe ser posterior a horaDesde');
    }

    return await turnoRepository.update(idTurno, data);
  },

  asignarProfesor: async (idTurno: number, idProfesor: number) => {
    const turno = await turnoRepository.findById(idTurno);
    if (!turno) {
      throw new HttpError(404, 'Turno no encontrado');
    }

    const profesor = await profesorRepository.obtenerProfesorPorId(idProfesor);
    if (!profesor) {
      throw new HttpError(404, 'Profesor no encontrado');
    }

    return await turnoRepository.asignarProfesor(idTurno, idProfesor);
  },

  desasignarProfesor: async (idTurno: number, idProfesor: number) => {
    await turnoService.findById(idTurno);
    const profesor = await profesorRepository.obtenerProfesorPorId(idProfesor);
    if (!profesor) {
      throw new HttpError(404, 'Profesor no encontrado');
    }

    return await turnoRepository.desasignarProfesor(idTurno, idProfesor);
  },

  cancelar: async (idTurno: number) => {
    await turnoService.findById(idTurno);
    return await turnoRepository.cancelar(idTurno);
  },

  remove: async (idTurno: number) => {
    const turno = await turnoService.findById(idTurno);
    if (turno.profesores && turno.profesores.length > 0) {
      throw new HttpError(400, 'No se puede eliminar el turno porque tiene profesores asignados');
    }
    return await turnoRepository.remove(idTurno);
  },

  obtenerProfesoresDeTurno: async (idTurno: number) => {
  const turno = await turnoRepository.obtenerProfesoresDeTurno(idTurno);
  if (!turno) {
    throw new HttpError(404, 'Turno no encontrado');
  }
  return turno;
},
};