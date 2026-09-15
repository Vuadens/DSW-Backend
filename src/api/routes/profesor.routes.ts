import { Router } from 'express';
import {
	getProfesores,
	createProfesor,
	getProfesorById,
	updateProfesor,
	deleteProfesor
} from '../controllers/profesor.controller';
import { validate, validateParams } from '../middlewares/validate.middleware';
import { profesorIdSchema, profesorSchema } from '../../services/schemas/profesor.schema';

const router = Router();

router.get('/', getProfesores);
router.post('/', validate(profesorSchema), createProfesor);
router.get('/:id', validateParams(profesorIdSchema), getProfesorById);
router.patch('/:id', validateParams(profesorIdSchema), validate(profesorSchema.partial()), updateProfesor);
router.delete('/:id', validateParams(profesorIdSchema), deleteProfesor);
router.put('/:id', validateParams(profesorIdSchema), validate(profesorSchema), updateProfesor);
export default router;
