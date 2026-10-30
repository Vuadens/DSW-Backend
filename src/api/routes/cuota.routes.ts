import { Router } from 'express';
import { cuotaController } from '../controllers/cuota.controller';
import { authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registrarCobroSchema } from '../../schemas/cuota.schema';

export const cuotaRouter = Router();

cuotaRouter.post('/', authorize('ADMINISTRADOR'), validate(registrarCobroSchema), cuotaController.registrarCobro);
