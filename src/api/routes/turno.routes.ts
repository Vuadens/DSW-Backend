import { Router } from 'express';
import { turnoController } from '../controllers/turno.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createTurnoSchema,
  updateTurnoSchema,
  asignarProfesorSchema,
} from '../../schemas/turno.schema';

const router = Router();

router.get('/', turnoController.getAll);
router.get('/:id', turnoController.getById);
router.post('/', validate(createTurnoSchema), turnoController.create);
router.patch('/:id', validate(updateTurnoSchema), turnoController.update);
router.patch('/:id/cancelar', turnoController.cancelar);
router.delete('/:id', turnoController.remove);
router.post('/:id/profesores', validate(asignarProfesorSchema), turnoController.asignarProfesor);   // Asignar profesor a un turno
router.delete('/:id/profesores/:idProfesor', turnoController.desasignarProfesor);   //Desasignar profesor a un turno
router.get('/:id/profesores', turnoController.obtenerProfesoresDeTurno);    // Obtener profesores de un turno
export default router;