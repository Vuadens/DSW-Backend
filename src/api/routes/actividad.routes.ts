import {Router} from 'express';
import {actividadController} from '../controllers/actividad.controller';
import {validate} from '../middlewares/validate.middleware';
import {createActividadSchema, updateActividadSchema} from '../../schemas/actividad.schema';
import {authorize} from '../middlewares/auth.middleware';
import {Rol} from '@prisma/client';

export const actividadRouter = Router();

actividadRouter.get('/', actividadController.getAll);
actividadRouter.get('/:id', actividadController.getById);
actividadRouter.post('/', authorize(Rol.ADMINISTRADOR), validate(createActividadSchema), actividadController.create);
actividadRouter.patch('/:id', authorize(Rol.ADMINISTRADOR), validate(updateActividadSchema), actividadController.update);
actividadRouter.delete('/:id', authorize(Rol.ADMINISTRADOR), actividadController.remove);