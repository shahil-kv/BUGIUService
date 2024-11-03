import dotenv from 'dotenv';
import { httpServer } from './app';
import connectDB from './db/index';
import logger from './logger/winston.logger';

dotenv.config({
  path: './.env',
});

/**
 * Starting from Node.js v14 top-level await is available and it is only available in ES modules.
 * This means you can not use it with common js modules or Node version < 14.
 */
const majorNodeVersion = process.env.NODE_VERSION ? +process.env.NODE_VERSION?.split('.')[0] || 0 : 17;

const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    logger.info(`📑 Visit the documentation at: http://localhost:${process.env.PORT || 8080}`);
    logger.info('⚙️  Server is running on port: ' + process.env.PORT);
  });
};

connectDB()
  .then(() => {
    startServer();
  })
  .catch((err: Error) => {
    logger.error('Mongo db connect error: ', err);
  });
