import { Router } from 'express';
import {
	getClases,
	createClase,
	getClaseById,
	updateClase,
	deleteClase
} from '../controllers/clase.controller';
import { validate, validateParams, validateQuery } from '../middlewares/validate.middleware';
import { claseFiltrosSchema, claseIdSchema, claseSchema } from '../../services/schemas/clase.schema';

const router = Router();

router.get('/', validateQuery(claseFiltrosSchema), getClases);
router.post('/', validate(claseSchema), createClase);
router.get('/:id', validateParams(claseIdSchema), getClaseById);
router.patch('/:id', validateParams(claseIdSchema), validate(claseSchema.partial()), updateClase);
router.put('/:id', validateParams(claseIdSchema), validate(claseSchema), updateClase);
router.delete('/:id', validateParams(claseIdSchema), deleteClase);

export default router;
