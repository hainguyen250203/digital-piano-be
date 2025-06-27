import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');

    // Add middleware for retry logic and query logging
    this.$use(async (params, next) => {
      const start = Date.now();
      let retries = 0;

      while (retries < this.MAX_RETRIES) {
        try {
          const result = await next(params);
          const duration = Date.now() - start;

          // Log slow queries
          if (duration > 1000) {
            this.logger.warn(
              `Slow query detected: ${params.model}.${params.action} - ${duration}ms`
            );
          }

          return result;
        } catch (error) {
          retries++;
          if (error.code === 'P1001' || error.message?.includes('connection')) {
            if (retries === this.MAX_RETRIES) {
              this.logger.error(`Failed to execute query after ${this.MAX_RETRIES} retries`, error);
              throw error;
            }
            this.logger.warn(`Connection error, retrying (${retries}/${this.MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
            await this.cleanDatabase(); // Try to reset connection
            continue;
          }
          throw error;
        }
      }
    });

    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    try {
      await this.$disconnect();
      this.logger.log('Database connection closed');
    } catch (error) {
      this.logger.error('Error during database disconnection', error);
    }
  }

  // Enable shutdown hooks for better handling of application shutdown
  async enableShutdownHooks(app: INestApplication) {
    this.logger.log('Enabling application shutdown hooks');

    // Register app shutdown hook to properly close Prisma connections
    app.enableShutdownHooks();

    // Handle various shutdown scenarios
    const cleanup = async () => {
      this.logger.log('Executing cleanup');
      try {
        await this.$disconnect();
      } catch (error) {
        this.logger.error('Error during cleanup', error);
      }
    };

    process.on('beforeExit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  // Utility method to explicitly clean connections when needed
  async cleanDatabase() {
    try {
      await this.$executeRaw`SELECT 1`;
      this.logger.log('Database connection checked and reset');
    } catch (error) {
      this.logger.error('Error checking database connection', error);
      // Try to reconnect
      await this.$disconnect();
      await this.$connect();
    }
  }
}
