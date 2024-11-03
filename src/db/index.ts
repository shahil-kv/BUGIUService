import { DB_NAME } from '../constant';
import dotenv from 'dotenv';
dotenv.config();

import database from '../configs/database';
import logger from '../logger/winston.logger';

export let dbInstance = undefined;

const connectDB = async () => {
  try {
    await await database.connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error: ', error);
    process.exit(1);
  }
};

export default connectDB;
