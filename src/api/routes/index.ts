//Solo hay que pensar que index.ts actúa como el tablero de conexiones o 
//distribuidor principal del proyecto.

import { Router } from 'express';   //Estás trayendo la herramienta Router del framework Express. Es como un mini-servidor que se encarga exclusivamente de organizar y agrupar direcciones web (URLs).
import planRouter from './plan.routes';
export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));        //ruta de comrpobacion muy comun en backend
apiRouter.use('/planes', planRouter);