import { Router } from 'express';
import { maquinaController } from '../controllers/maquina.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createMaquinaSchema,
  updateMaquinaSchema,
} from '../../schemas/maquina.schema';

const router = Router();

router.get('/', maquinaController.getAll);
router.get('/:id', maquinaController.getById);
router.post('/', validate(createMaquinaSchema), maquinaController.create);
router.patch('/:id', validate(updateMaquinaSchema), maquinaController.update);
router.patch('/:id/inhabilitar', maquinaController.inhabilitar);
router.patch('/:id/reparacion', maquinaController.mandarAReparacion);
router.delete('/:id', maquinaController.remove);

export default router;