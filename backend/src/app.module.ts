import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { ProvidersModule } from './providers/providers.module';
import { PayoutsModule } from './payouts/payouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // В продакшене лучше использовать миграции
        
        // Настройки для правильной работы с транзакциями
        extra: {
          // Увеличиваем timeout для длительных транзакций
          connectionTimeoutMillis: 30000,
          query_timeout: 30000,
          statement_timeout: 30000,
        },
        
        // Настройки пула соединений
        poolSize: 20,
        acquireTimeout: 60000,
        timeout: 60000,
        
        // Логирование SQL для отладки (в development)
        logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      }),
    }),
    TransactionsModule,
    UsersModule,
    ProvidersModule,
    PayoutsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    // Создаем дефолтного пользователя при старте приложения
    try {
      const defaultUser = await this.usersService.createDefaultUser();
      console.log(`[App] Default user created/loaded: ${defaultUser.id} with balance: ${defaultUser.balanceKopecks} kopecks, currency: ${defaultUser.currency}`);
    } catch (error) {
      console.error('[App] Failed to create default user:', error.message);
    }
  }
}
