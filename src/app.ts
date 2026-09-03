import express from 'express';
import cors from 'cors';
import { apiRouter } from './api/routes';
import { errorHandler } from './api/middlewares/error.middleware';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(errorHandler);
  return app;
};
