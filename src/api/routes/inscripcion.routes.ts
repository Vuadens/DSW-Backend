import { Router } from 'express';
import { inscripcionController } from '../controllers/inscripcion.controller';
import { validate, validateQuery } from '../middlewares/validate.middleware';
import { asistenciaSchema, createInscripcionSchema, inscripcionFiltrosSchema } from '../../schemas/inscripcion.schema';
import { authorize } from '../middlewares/auth.middleware';
import { Rol } from '@prisma/client';

const router = Router();

router.get('/', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), validateQuery(inscripcionFiltrosSchema), inscripcionController.getAll);
router.get('/:id', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), inscripcionController.getById);
router.post('/', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), validate(createInscripcionSchema), inscripcionController.create);
router.patch('/:id/cancelar', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR, Rol.SOCIO), inscripcionController.cancelar);
router.patch('/:id/asistencia', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), validate(asistenciaSchema), inscripcionController.asistencia);
router.delete('/:id', authorize(Rol.ADMINISTRADOR), inscripcionController.remove);

export default router;
