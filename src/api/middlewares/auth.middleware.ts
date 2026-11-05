import {NextFunction, Request, Response} from 'express';
import {Rol} from '@prisma/client';
import {AuthTokenPayload, verifyToken} from '../../utils/jwt';
import {HttpError} from '../../utils/http-error';
import {usuarioRepository} from '../../repositories/usuario.repository';

declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
        }
    }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
        return next(new HttpError(401, 'No autenticado'));
    }

    let user: AuthTokenPayload;
    try {
        user = verifyToken(header.slice(7));
    } catch (_error) {
        return next(new HttpError(401, 'Token inválido o vencido'));
    }

    // Una cuenta desactivada (por ejemplo, un socio dado de baja) pierde el acceso
    // en el momento, aunque su token todavía no haya vencido.
    try {
        const cuenta = await usuarioRepository.findById(user.id);
        if (!cuenta || !cuenta.activo) return next(new HttpError(401, 'La cuenta está desactivada'));
    } catch (error) {
        return next(error);
    }

    req.user = user;
    next();
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
