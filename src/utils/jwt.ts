import jwt, {SignOptions} from 'jsonwebtoken';
import {Rol} from '@prisma/client';
import {env} from '../config/env';

export type AuthTokenPayload = {
    id: number;
    rol: Rol;
    socioId?: number;
    profesorId?: number;
};

export const signToken = ({sub, rol, socioId, profesorId}: {
    sub: number;
    rol: Rol;
    socioId?: number;
    profesorId?: number;
}) =>
    jwt.sign({rol, socioId, profesorId}, env.jwtSecret, {
        subject: String(sub),
        expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    });

export const verifyToken = (token: string): AuthTokenPayload => {
    const payload = jwt.verify(token, env.jwtSecret);

    const id = Number(payload && typeof payload === 'object' ? payload.sub : NaN);
    if (typeof payload !== 'object' || payload === null || typeof payload.sub !== 'string' ||
        !Number.isSafeInteger(id) || id <= 0) {
        throw new Error('Token inválido');
    }

    if (!Object.values(Rol).includes(payload.rol as Rol)) {
        throw new Error('Token inválido');
    }

    const socioId = typeof payload.socioId === 'number' ? payload.socioId : undefined;
    const profesorId = typeof payload.profesorId === 'number' ? payload.profesorId : undefined;
    return {id, rol: payload.rol as Rol, socioId, profesorId};
};
