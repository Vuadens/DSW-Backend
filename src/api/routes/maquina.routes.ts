import { Router } from 'express';
import { Rol } from '@prisma/client';
import { maquinaController } from '../controllers/maquina.controller';
import { validate, validateParams } from '../middlewares/validate.middleware';
import { authorize } from '../middlewares/auth.middleware';
import {
  createMaquinaSchema,
  updateMaquinaSchema,
  vincularActividadSchema,
  maquinaIdSchema,
  maquinaActividadParamsSchema,
} from '../../schemas/maquina.schema';

const router = Router();
const soloAdmin = authorize(Rol.ADMINISTRADOR);

router.get('/', maquinaController.getAll);
router.get('/:id', validateParams(maquinaIdSchema), maquinaController.getById);
router.post('/', soloAdmin, validate(createMaquinaSchema), maquinaController.create);
router.patch('/:id', soloAdmin, validateParams(maquinaIdSchema), validate(updateMaquinaSchema), maquinaController.update);
router.patch('/:id/inhabilitar', soloAdmin, validateParams(maquinaIdSchema), maquinaController.inhabilitar);
router.patch('/:id/reparacion', soloAdmin, validateParams(maquinaIdSchema), maquinaController.mandarAReparacion);
router.delete('/:id', soloAdmin, validateParams(maquinaIdSchema), maquinaController.remove);
router.post('/:id/actividades', soloAdmin, validateParams(maquinaIdSchema), validate(vincularActividadSchema), maquinaController.vincularActividad);
router.delete('/:id/actividades/:idActividad', soloAdmin, validateParams(maquinaActividadParamsSchema), maquinaController.desvincularActividad);

export default router;
