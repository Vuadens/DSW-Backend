import { Router } from 'express';
import { actividadRouter } from './actividad.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));

apiRouter.use('/actividades', actividadRouter);