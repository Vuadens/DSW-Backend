import { Router } from 'express';
import {
	getProfesores,
	createProfesor,
	getProfesorById,
	updateProfesor,
	deleteProfesor
} from '../controllers/profesor.controller';

const router = Router();

router.get('/', getProfesores);
router.post('/', createProfesor);
router.get('/:id', getProfesorById);
router.patch('/:id', updateProfesor);
router.delete('/:id', deleteProfesor);

export default router;
