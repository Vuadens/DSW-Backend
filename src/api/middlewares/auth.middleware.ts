import { NextFunction, Request, Response } from 'express';

export const authMiddleware = (_req: Request, _res: Response, next: NextFunction) => next();
