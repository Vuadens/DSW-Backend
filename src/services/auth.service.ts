import {usuarioRepository} from '../repositories/usuario.repository';
import {LoginInput} from '../schemas/auth.schema';
import {comparePassword} from '../utils/password';
import {signToken} from '../utils/jwt';
import {HttpError} from '../utils/http-error';

const INVALID_CREDENTIALS = 'Credenciales inválidas';

export const authService = {
    login: async ({identificador, password}: LoginInput) => {
        const found = identificador.includes('@')
            ? await usuarioRepository.findByEmail(identificador.toLowerCase())
            : await usuarioRepository.findByDni(identificador);
        if (!found || !found.activo) throw new HttpError(401, INVALID_CREDENTIALS);

        const passwordOk = await comparePassword(password, found.passwordHash);
        if (!passwordOk) throw new HttpError(401, INVALID_CREDENTIALS);

        return {
            token: signToken({
                sub: found.idUsuario,
                rol: found.rol,
                personaId: found.personaId,
            }),
            usuario: {
                idUsuario: found.idUsuario,
                usuario: found.usuario,
                email: found.email,
                rol: found.rol,
                personaId: found.personaId,
            },
        };
    },

    me: async (idUsuario: number) => {
        const usuario = await usuarioRepository.findPerfil(idUsuario);
        if (!usuario) throw new HttpError(404, 'Usuario no encontrado');
        return usuario;
    },
};
