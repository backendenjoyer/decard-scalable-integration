import { Controller, Post, Body } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Controller('payouts')
export class PayoutsController {
    constructor(private readonly payoutsService: PayoutsService) {}

    @Post()
    create(@Body() payoutData: CreatePayoutDto) {
        return this.payoutsService.create(payoutData);
    }
}
