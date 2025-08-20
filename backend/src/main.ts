import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  console.log('[Backend] Starting backend service...');
  const app = await NestFactory.create(AppModule);

  // Включаем CORS для development
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: ['http://localhost:3002', 'http://localhost:3000'],
      credentials: true,
    });
  }

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER],
        retry: {
          initialRetryTime: 100,
          retries: 10
        },
      },
      consumer: {
        groupId: 'gate-consumers',
        retry: {
          initialRetryTime: 100,
          retries: 10
        },
      },
    },
  });

  console.log('[Backend] Starting microservices...');
  await app.startAllMicroservices();
  console.log('[Backend] Microservices started successfully');
  
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  console.log('[Backend] API server started on port 3000');
}

bootstrap().catch(error => {
  console.error('[Backend] Failed to start:', error);
  process.exit(1);
});
