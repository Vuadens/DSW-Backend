import { Router } from 'express';
import planRouter from './plan.routes';
export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.use('/planes', planRouter);
