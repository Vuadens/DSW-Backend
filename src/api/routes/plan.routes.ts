import { Router } from 'express';
import { getPlanes, createPlan, getPlanById, updatePlan, deletePlan } from '../controllers/plan.controller'; 
import { validate } from '../middlewares/validate.middleware'; // Usamos el middleware del equipo
import { planSchema } from '../../schemas/plan.schema';
const router = Router();

router.get('/', getPlanes);
router.post('/', validate(planSchema), createPlan)
router.get('/:id', getPlanById); 
router.patch('/:id', validate(planSchema.partial()), updatePlan);
router.delete('/:id', deletePlan);
export default router;