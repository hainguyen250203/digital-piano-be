import { AppModule } from '@/app.module';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { GlobalGrpcExceptionFilter } from '@/Common/filters/http-exception.filter';
import { SwaggerAuthMiddleware } from '@/Common/middlewares/swagger-auth.middleware';
import { Logger, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Create a custom IoAdapter with enhanced logging
class CustomIoAdapter extends IoAdapter {
  private readonly logger = new Logger('WebSocketsAdapter');

  constructor(app) {
    super(app);
    this.logger.log('Custom WebSockets adapter initialized');
  }

  createIOServer(port: number, options?: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.logger.log(`Creating Socket.IO server with CORS origin: ${frontendUrl}`);

    // Configure Socket.IO options
    const socketOptions = {
      cors: {
        origin: [frontendUrl],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      ...options,
    };

    // Create Socket.IO server with configured options
    const server = super.createIOServer(port, socketOptions);

    // Add debugging
    server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

      socket.on('disconnect', (reason) => {
        this.logger.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });
    });


    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const logger = new Logger('Bootstrap');

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL
  });

  // WebSocket configuration with custom adapter
  app.useWebSocketAdapter(new CustomIoAdapter(app));
  logger.log('WebSockets enabled with custom adapter');

  const configService = app.get(ConfigService);
  app.useGlobalFilters(new GlobalGrpcExceptionFilter(configService));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // Configure CORS for HTTP and WebSockets
  app.enableCors();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true); // ⚠️ Cho phép lấy IP client qua proxy


  // Swagger
  app.use('/docs', new SwaggerAuthMiddleware().use);
  const config = new DocumentBuilder()
    .setTitle('Digital Piano example')
    .setDescription('The Digital Piano API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
