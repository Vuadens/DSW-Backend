import {Router} from 'express';
import {
    getProfesores,
    createProfesor,
    getProfesorById,
    updateProfesor,
    deleteProfesor
} from '../controllers/profesor.controller';
import {validate, validateParams} from '../middlewares/validate.middleware';
import {profesorIdSchema, profesorSchema} from '../../schemas/profesor.schema';
import {authorize} from '../middlewares/auth.middleware';
import {Rol} from '@prisma/client';

const router = Router();

router.get('/', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), getProfesores);
router.post('/', authorize(Rol.ADMINISTRADOR), validate(profesorSchema), createProfesor);
router.get('/:id', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), validateParams(profesorIdSchema), getProfesorById);
router.patch('/:id', authorize(Rol.ADMINISTRADOR, Rol.PROFESOR), validateParams(profesorIdSchema), validate(profesorSchema.partial()), updateProfesor);
router.delete('/:id', authorize(Rol.ADMINISTRADOR), validateParams(profesorIdSchema), deleteProfesor);
export default router;
