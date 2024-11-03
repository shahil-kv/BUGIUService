import { PrismaClient } from '@prisma/client';
import logger from '../logger/winston.logger';

class Database {
  private static instance: Database;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'error', emit: 'stdout' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
        { level: 'query', emit: 'stdout' },
      ],
      errorFormat: 'pretty',
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$use(async (params: any, next: any) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        logger.info(`Query ${params.model}.${params.action} took ${after - before}ms`);
        return result;
      });
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected successfully');

      // Test the connection
      await this.prisma.$queryRaw`SELECT 1`;
      logger.info('✅ Database query test successful');
    } catch (error: any) {
      logger.error('❌ Database connection error:', error.message);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error: any) {
      logger.error('Error disconnecting from database:', error.message);
      throw error;
    }
  }
}

export default Database.getInstance();
