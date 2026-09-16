import { Router } from 'express';
import { actividadController } from '../controllers/actividad.controller';
import { validate } from '../middlewares/validate.middleware';
import { createActividadSchema, updateActividadSchema } from '../../schemas/actividad.schema';

export const actividadRouter = Router();

actividadRouter.get('/', actividadController.getAll);
actividadRouter.get('/:id', actividadController.getById);
actividadRouter.post('/', validate(createActividadSchema), actividadController.create);
actividadRouter.put('/:id', validate(updateActividadSchema), actividadController.update);
actividadRouter.delete('/:id', actividadController.remove);