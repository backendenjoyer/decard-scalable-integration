import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('[Webhook Worker] Starting webhook worker...');
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  
  // Webhook worker слушает на порту 3001
  await app.listen(3001);
  console.log('[Webhook Worker] Running on port 3001');
}
bootstrap();
