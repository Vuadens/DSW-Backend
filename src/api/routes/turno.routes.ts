import { Router } from 'express';
import { turnoController } from '../controllers/turno.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createTurnoSchema,
  updateTurnoSchema,
  asignarProfesorSchema,
} from '../../schemas/turno.schema';
import { authorize } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

const router = Router();

// Lectura: personal del gimnasio (admin y profesores). Escritura: solo administrador.
const lectura = authorize(Rol.ADMINISTRADOR, Rol.PROFESOR);
const escritura = authorize(Rol.ADMINISTRADOR);

router.get('/', lectura, turnoController.getAll);
router.get('/:id', lectura, turnoController.getById);
router.post('/', escritura, validate(createTurnoSchema), turnoController.create);
router.patch('/:id', escritura, validate(updateTurnoSchema), turnoController.update);
router.patch('/:id/cancelar', escritura, turnoController.cancelar);
router.delete('/:id', escritura, turnoController.remove);
router.post('/:id/profesores', escritura, validate(asignarProfesorSchema), turnoController.asignarProfesor);   // Asignar profesor a un turno
router.delete('/:id/profesores/:idProfesor', escritura, turnoController.desasignarProfesor);   //Desasignar profesor a un turno
router.get('/:id/profesores', lectura, turnoController.obtenerProfesoresDeTurno);    // Obtener profesores de un turno
export default router;