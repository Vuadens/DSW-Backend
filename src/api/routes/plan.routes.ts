import { Router } from 'express';
// Agrego createPlan en esta importación:
import { getPlanes, createPlan, getPlanById } from '../controllers/plan.controller'; 

const router = Router();

// Cuando llegue una petición GET a la raíz de esta ruta, ejecuta la función getPlanes
router.get('/', getPlanes);
router.post('/', createPlan);
router.get('/:id', getPlanById); // <-- Nueva ruta agregada
export default router;