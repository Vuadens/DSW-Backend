import {Router} from 'express';
import {
    getAdministradores,
    createAdministrador,
    getAdministradorById,
    updateAdministrador,
    deleteAdministrador
} from '../controllers/administrador.controller';
import {validate, validateParams} from '../middlewares/validate.middleware';
import {administradorIdSchema, administradorSchema} from '../../schemas/administrador.schema';
import {authorize} from '../middlewares/auth.middleware';
import {Rol} from '@prisma/client';

const router = Router();

// La gestion de administradores es exclusiva del administrador
router.use(authorize(Rol.ADMINISTRADOR));

router.get('/', getAdministradores);
router.post('/', validate(administradorSchema), createAdministrador);
router.get('/:id', validateParams(administradorIdSchema), getAdministradorById);
router.patch('/:id', validateParams(administradorIdSchema), validate(administradorSchema.partial()), updateAdministrador);
router.delete('/:id', validateParams(administradorIdSchema), deleteAdministrador);
export default router;
