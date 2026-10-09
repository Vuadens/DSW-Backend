import { Router } from 'express';
import { inscripcionController } from '../controllers/inscripcion.controller';
import { validate } from '../middlewares/validate.middleware';
import { createInscripcionSchema } from '../../schemas/inscripcion.schema';

const router = Router();

router.get('/', inscripcionController.getAll);
router.get('/:id', inscripcionController.getById);
router.post('/', validate(createInscripcionSchema), inscripcionController.create);
router.patch('/:id/cancelar', inscripcionController.cancelar);
router.delete('/:id', inscripcionController.remove);

export default router;