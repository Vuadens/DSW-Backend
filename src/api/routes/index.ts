import { Router } from 'express';
import { socioRouter } from "./socio.routes";

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));

apiRouter.use("/socios", socioRouter);