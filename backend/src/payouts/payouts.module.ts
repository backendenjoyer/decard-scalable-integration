import { Module } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { DecardService } from '../providers/decard/decard.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), HttpModule],
  controllers: [PayoutsController],
  providers: [PayoutsService, DecardService],
})
export class PayoutsModule {}
