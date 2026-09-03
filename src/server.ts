import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';

createApp().listen(env.port, () => {
  console.log(`Servidor escuchando en http://localhost:${env.port}`);
});
