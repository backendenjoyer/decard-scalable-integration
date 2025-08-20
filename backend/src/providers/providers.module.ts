import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { DecardService } from './decard/decard.service';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [ProvidersController],
  providers: [DecardService],
})
export class ProvidersModule {}
