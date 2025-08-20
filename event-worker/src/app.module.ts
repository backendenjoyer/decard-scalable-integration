import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventProcessingController } from './event-processing.controller';
import { EventProcessingService } from './event-processing.service';
import { Transaction } from './entities/transaction.entity';
import { User } from './entities/user.entity';

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
        synchronize: true,
        
        // Настройки для правильной работы с транзакциями
        extra: {
          connectionTimeoutMillis: 30000,
          query_timeout: 30000,
          statement_timeout: 30000,
        },
        
        poolSize: 20,
        acquireTimeout: 60000,
        timeout: 60000,
        
        logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      }),
    }),
    TypeOrmModule.forFeature([Transaction, User]),
  ],
  controllers: [EventProcessingController],
  providers: [EventProcessingService],
})
export class AppModule {}
