import {Router} from 'express';
import {authController} from '../controllers/auth.controller';
import {authenticate} from '../middlewares/auth.middleware';
import {validate} from '../middlewares/validate.middleware';
import {loginSchema} from '../../schemas/auth.schema';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/me', authenticate, authController.me);
