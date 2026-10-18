import {Router} from 'express';
import {getPlanes, createPlan, getPlanById, updatePlan, deletePlan} from '../controllers/plan.controller';
import {validate} from '../middlewares/validate.middleware'; // Usamos el middleware del equipo
import {planSchema} from '../../schemas/plan.schema';
import {authorize} from '../middlewares/auth.middleware';
import {Rol} from '@prisma/client';

const router = Router();

router.get('/', getPlanes);
router.post('/', authorize(Rol.ADMINISTRADOR), validate(planSchema), createPlan);
router.get('/:id', getPlanById);
router.patch('/:id', authorize(Rol.ADMINISTRADOR), validate(planSchema.partial()), updatePlan);
router.delete('/:id', authorize(Rol.ADMINISTRADOR), deletePlan);
export default router;