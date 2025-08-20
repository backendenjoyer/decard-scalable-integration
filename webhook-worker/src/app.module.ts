import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { KafkaService } from './kafka.service';
import { WebhookValidationMiddleware } from './webhook-validation.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [WebhookController],
  providers: [WebhookService, KafkaService, WebhookValidationMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WebhookValidationMiddleware)
      .forRoutes('webhook/*'); // Применяем ко всем webhook эндпоинтам
  }
}
