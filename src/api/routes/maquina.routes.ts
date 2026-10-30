import { Router } from 'express';
import { Rol } from '@prisma/client';
import { maquinaController } from '../controllers/maquina.controller';
import { validate, validateParams } from '../middlewares/validate.middleware';
import { authorize } from '../middlewares/auth.middleware';
import {
  createMaquinaSchema,
  updateMaquinaSchema,
  vincularClaseSchema,
  maquinaIdSchema,
  maquinaClaseParamsSchema,
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
router.post('/:id/clases', soloAdmin, validateParams(maquinaIdSchema), validate(vincularClaseSchema), maquinaController.vincularClase);
router.delete('/:id/clases/:idClase', soloAdmin, validateParams(maquinaClaseParamsSchema), maquinaController.desvincularClase);

export default router;
