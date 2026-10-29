import jwt, {SignOptions} from 'jsonwebtoken';
import {Rol} from '@prisma/client';
import {env} from '../config/env';

export type AuthTokenPayload = {
    id: number;
    rol: Rol;
    personaId: number;
};

export const signToken = ({sub, rol, personaId}: {
    sub: number;
    rol: Rol;
    personaId: number;
}) =>
    jwt.sign({rol, personaId}, env.jwtSecret, {
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

    // Los tokens emitidos antes de Persona no traen personaId: hay que volver a loguearse.
    if (typeof payload.personaId !== 'number') {
        throw new Error('Token inválido');
    }

    return {id, rol: payload.rol as Rol, personaId: payload.personaId};
};
