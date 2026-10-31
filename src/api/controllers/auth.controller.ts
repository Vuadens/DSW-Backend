import {NextFunction, Request, Response} from 'express';
import {authService} from '../../services/auth.service';
import {createSocio} from '../../services/socio.service';

export const authController = {
    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await authService.login(req.body));
        } catch (error) {
            next(error);
        }
    },
    registro: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(201).json(await createSocio(req.body));
        } catch (error) {
            next(error);
        }
    },
    cambiarPassword: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await authService.cambiarPassword(req.user!.id, req.body));
        } catch (error) {
            next(error);
        }
    },
    me: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await authService.me(req.user!.id));
        } catch (error) {
            next(error);
        }
    },
};
