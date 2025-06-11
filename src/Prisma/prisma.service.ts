import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');

    // Add middleware for connection tracking
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      // Log slow queries (over 1000ms)
      if (after - before > 1000) {
        this.logger.warn(
          `Slow query detected: ${params.model}.${params.action} - ${after - before}ms`
        );
      }

      return result;
    });

    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  // Enable shutdown hooks for better handling of application shutdown
  async enableShutdownHooks(app: INestApplication) {
    this.logger.log('Enabling application shutdown hooks');

    // Register app shutdown hook to properly close Prisma connections
    app.enableShutdownHooks();

    // This ensures Prisma gets a chance to clean up connections before app shuts down
    process.on('beforeExit', async () => {
      this.logger.log('Executing beforeExit cleanup');
      await this.$disconnect();
    });
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
