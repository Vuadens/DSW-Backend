import { Router } from 'express';
import { inscripcionController } from '../controllers/inscripcion.controller';
import { validate } from '../middlewares/validate.middleware';
import { createInscripcionSchema } from '../../schemas/inscripcion.schema';
import { authorize } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

const router = Router();

router.get('/', inscripcionController.getAll);
router.get('/:id', inscripcionController.getById);
router.post('/', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), validate(createInscripcionSchema), inscripcionController.create);
router.patch('/:id/cancelar', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), inscripcionController.cancelar);
router.delete('/:id', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), inscripcionController.remove);

export default router;