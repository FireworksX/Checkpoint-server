import express from 'express';
import passport from 'passport';
import apiRouter from '@server/routes/v1';
import passportStrategies from '@server/config/passport';
import { errorHandler } from '@server/middleware/errorHandler.middleware';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      _id: 10
    }
  }
}

const createServer = (): express.Application => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static('uploads'));

  app.use(passport.initialize());
  passport.use('jwt', passportStrategies.jwt);

  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    res.send('UP');
  });

  app.use('/api/v1', apiRouter);

  app.use(errorHandler)

  return app;
};

export { createServer };
