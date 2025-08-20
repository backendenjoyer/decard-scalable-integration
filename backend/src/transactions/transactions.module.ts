import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { DecardService } from '../providers/decard/decard.service';
import { HttpModule } from '@nestjs/axios';
import { KafkaModule } from '../kafka/kafka.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]), 
    HttpModule,
    KafkaModule,
    UsersModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, DecardService],
})
export class TransactionsModule {}
