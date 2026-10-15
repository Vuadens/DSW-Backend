import {Router} from 'express';
import {usuarioController} from '../controllers/usuario.controller';
import {validate} from '../middlewares/validate.middleware';
import {createUsuarioSchema, updateUsuarioSchema} from '../../schemas/usuario.schema';

export const usuarioRouter = Router();

usuarioRouter.get('/', usuarioController.getAll);
usuarioRouter.get('/:id', usuarioController.getById);
usuarioRouter.post('/', validate(createUsuarioSchema), usuarioController.create);
usuarioRouter.patch('/:id', validate(updateUsuarioSchema), usuarioController.update);
usuarioRouter.delete('/:id', usuarioController.remove);
