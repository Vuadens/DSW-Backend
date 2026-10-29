import {Router} from 'express';
import {usuarioController} from '../controllers/usuario.controller';
import {validate} from '../middlewares/validate.middleware';
import {createUsuarioSchema, updateUsuarioSchema} from '../../schemas/usuario.schema';
import {authorize} from '../middlewares/auth.middleware';
import {Rol} from '@prisma/client';

export const usuarioRouter = Router();

// Toda la gestion de usuarios es exclusiva del administrador
usuarioRouter.use(authorize(Rol.ADMINISTRADOR));

usuarioRouter.get('/', usuarioController.getAll);
usuarioRouter.get('/:id', usuarioController.getById);
usuarioRouter.post('/', validate(createUsuarioSchema), usuarioController.create);
usuarioRouter.patch('/:id', validate(updateUsuarioSchema), usuarioController.update);
usuarioRouter.delete('/:id', usuarioController.remove);
