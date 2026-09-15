import { Router } from 'express';
import { actividadRouter } from './actividad.routes';
import planRouter from './plan.routes';
import profesorRouter from './profesor.routes';
import { socioRouter } from "./socio.routes";

export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.use('/planes', planRouter);
apiRouter.use('/profesores', profesorRouter);
apiRouter.use("/socios", socioRouter);
apiRouter.use('/actividades', actividadRouter);