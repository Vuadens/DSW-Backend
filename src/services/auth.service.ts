import {usuarioRepository} from '../repositories/usuario.repository';
import {CambiarPasswordInput, LoginInput} from '../schemas/auth.schema';
import {comparePassword, hashPassword} from '../utils/password';
import {signToken} from '../utils/jwt';
import {HttpError} from '../utils/http-error';

const INVALID_CREDENTIALS = 'Credenciales inválidas';

type Cuenta = NonNullable<Awaited<ReturnType<typeof usuarioRepository.findByEmail>>>;

const sesion = ({idUsuario, usuario, email, rol, personaId, debeCambiarPassword}: Omit<Cuenta, 'passwordHash'>) => ({
    token: signToken({sub: idUsuario, rol, personaId, debeCambiarPassword}),
    usuario: {idUsuario, usuario, email, rol, personaId, debeCambiarPassword},
});

export const authService = {
    login: async ({identificador, password}: LoginInput) => {
        const found = identificador.includes('@')
            ? await usuarioRepository.findByEmail(identificador.toLowerCase())
            : await usuarioRepository.findByDni(identificador);
        if (!found || !found.activo) throw new HttpError(401, INVALID_CREDENTIALS);

        const passwordOk = await comparePassword(password, found.passwordHash);
        if (!passwordOk) throw new HttpError(401, INVALID_CREDENTIALS);

        return sesion(found);
    },

    // Devuelve un token nuevo: el anterior sigue marcado con la contraseña inicial.
    cambiarPassword: async (idUsuario: number, {passwordActual, passwordNueva}: CambiarPasswordInput) => {
        const found = await usuarioRepository.findConPassword(idUsuario);
        if (!found) throw new HttpError(404, 'Usuario no encontrado');

        const passwordOk = await comparePassword(passwordActual, found.passwordHash);
        if (!passwordOk) throw new HttpError(400, 'La contraseña actual es incorrecta');
        if (passwordActual === passwordNueva) {
            throw new HttpError(400, 'La contraseña nueva debe ser distinta de la actual');
        }

        return sesion(await usuarioRepository.update(idUsuario, {
            passwordHash: await hashPassword(passwordNueva),
            debeCambiarPassword: false,
        }));
    },

    me: async (idUsuario: number) => {
        const usuario = await usuarioRepository.findPerfil(idUsuario);
        if (!usuario) throw new HttpError(404, 'Usuario no encontrado');
        return usuario;
    },
};
