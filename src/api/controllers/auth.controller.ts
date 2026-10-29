import {NextFunction, Request, Response} from 'express';
import {authService} from '../../services/auth.service';

export const authController = {
    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await authService.login(req.body));
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
