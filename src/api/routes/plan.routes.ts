import { Router } from 'express';
import { getPlanes, createPlan, getPlanById, updatePlan } from '../controllers/plan.controller'; 
const router = Router();

router.get('/', getPlanes);
router.post('/', createPlan);
router.get('/:id', getPlanById); 
router.patch('/:id', updatePlan); 
export default router;