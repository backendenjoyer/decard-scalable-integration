import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
        retry: {
          initialRetryTime: 100,
          retries: 10
        },
      },
      consumer: {
        groupId: 'event-processing-group',
        retry: {
          initialRetryTime: 100,
          retries: 10
        },
      },
    },
  });

  console.log('[Event Worker] Connecting to Kafka...');
  await app.listen();
  console.log('[Event Worker] Connected! Listening to Kafka events');
}

bootstrap().catch(error => {
  console.error('[Event Worker] Failed to start:', error);
  process.exit(1);
});
