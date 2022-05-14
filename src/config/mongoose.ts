import mongoose from 'mongoose';
import vars from '@server/config/vars';
import { logger } from '@config/logger';

const { mongo, env } = vars;

mongoose.Promise = Promise;

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

if (env === 'development') {
  mongoose.set('debug', true);
}

export const createMongooseConnection = async () => {
  await mongoose.connect(mongo.uri, {
    keepAlive: true,
  });

  logger.log({ level: 'info', message: 'mongoDB connected...' });
  return mongoose.connection;
};
