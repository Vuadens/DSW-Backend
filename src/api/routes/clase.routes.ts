import { Router } from 'express';
import {
	getClases,
	createClase,
	getClaseById,
	updateClase,
	deleteClase
} from '../controllers/clase.controller';
import { validate, validateParams, validateQuery } from '../middlewares/validate.middleware';
import { claseFiltrosSchema, claseIdSchema, claseSchema } from '../../schemas/clase.schema';
import { authorize } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

const router = Router();

router.get('/', validateQuery(claseFiltrosSchema), getClases);
router.post('/', authorize(Rol.ADMINISTRADOR), validate(claseSchema), createClase);
router.get('/:id', validateParams(claseIdSchema), getClaseById);
router.patch('/:id', authorize(Rol.ADMINISTRADOR), validateParams(claseIdSchema), validate(claseSchema.partial()), updateClase);
router.delete('/:id', authorize(Rol.ADMINISTRADOR), deleteClase);

export default router;
