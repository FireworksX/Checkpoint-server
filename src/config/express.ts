import express from 'express';
import apiRouter from '@server/routes/v1';

const createServer = (): express.Application => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    res.send('UP');
  });

  app.use('/api/v1', apiRouter);

  return app;
};

export { createServer };
