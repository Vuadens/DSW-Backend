import {Router} from 'express';
import {authController} from '../controllers/auth.controller';
import {authenticate} from '../middlewares/auth.middleware';
import {validate} from '../middlewares/validate.middleware';
import {cambiarPasswordSchema, loginSchema} from '../../schemas/auth.schema';
import {registroSocioSchema} from '../../schemas/socio.schema';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/registro', validate(registroSocioSchema), authController.registro);
authRouter.post('/cambiar-password', authenticate, validate(cambiarPasswordSchema), authController.cambiarPassword);
authRouter.get('/me', authenticate, authController.me);
