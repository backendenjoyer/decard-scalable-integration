import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  
  // Настройка OpenAPI/Swagger документации
  const config = new DocumentBuilder()
    .setTitle('Gate Payment System API')
    .setDescription('Микросервисная платежная система с интеграцией DeCard API для payin/payout операций в валюте TRY')
    .setVersion('1.0')
    .addTag('transactions', 'Операции пополнения баланса (Payin)')
    .addTag('payouts', 'Операции вывода средств (Payout)')
    .addTag('users', 'Управление пользователями и балансами')
    .addTag('providers', 'Информация о платежных провайдерах')
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Gate Payment System API',
    customfavIcon: '💳',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  console.log('[Backend] API server started on port 3000');
  console.log('[Backend] 📚 Swagger UI доступен по адресу: http://localhost:3000/api');
}

bootstrap().catch(error => {
  console.error('[Backend] Failed to start:', error);
  process.exit(1);
});
