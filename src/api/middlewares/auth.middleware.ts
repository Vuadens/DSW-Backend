import {NextFunction, Request, Response} from 'express';
import {Rol} from '@prisma/client';
import {AuthTokenPayload, verifyToken} from '../../utils/jwt';
import {HttpError} from '../../utils/http-error';

declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
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

// Si viene token lo valida y carga req.user; si no viene, deja pasar (rutas publicas).
// Las rutas protegidas exigen usuario con authorize().
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
    if (!req.header('Authorization')) return next();
    authenticate(req, res, next);
};

export const authorize = (...roles: Rol[]) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'No autenticado'));
    // Con la contraseña inicial solo se puede consultar el perfil y cambiarla.
    if (req.user.debeCambiarPassword) return next(new HttpError(403, 'Debe cambiar la contraseña'));
    if (!roles.includes(req.user.rol)) return next(new HttpError(403, 'No autorizado'));
    next();
};
