import { Router } from 'express';
// Agrego createPlan en esta importación:
import { getPlanes, createPlan } from '../controllers/plan.controller'; 

const router = Router();

// Cuando llegue una petición GET a la raíz de esta ruta, ejecuta la función getPlanes
router.get('/', getPlanes);
// LA NUEVA RUTA:
router.post('/', createPlan);
export default router;