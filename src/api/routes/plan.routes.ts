import { Router } from 'express';
import { getPlanes } from '../controllers/plan.controller';

const router = Router();

// Cuando llegue una petición GET a la raíz de esta ruta, ejecuta la función getPlanes
router.get('/', getPlanes);

export default router;