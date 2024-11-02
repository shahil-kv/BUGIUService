import { DATABASE_CONFIG } from '../datasources/database.config';

export const DATABASE_CONNECT = async () => {
  await DATABASE_CONFIG.sync();
};
