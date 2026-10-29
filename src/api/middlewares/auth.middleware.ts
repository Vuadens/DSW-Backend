import {NextFunction, Request, Response} from 'express';
import {Rol} from '@prisma/client';
import {verifyToken} from '../../utils/jwt';
import {HttpError} from '../../utils/http-error';

declare global {
    namespace Express {
        interface Request {
            user?: { id: number; rol: Rol; socioId?: number; profesorId?: number };
        }
    }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
        return next(new HttpError(401, 'No autenticado'));
    }

    try {
        req.user = verifyToken(header.slice(7));
        next();
    } catch (_error) {
        next(new HttpError(401, 'Token inválido o vencido'));
    }
};

export const authorize = (...roles: Rol[]) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol)) return next(new HttpError(403, 'No autorizado'));
    next();
};
