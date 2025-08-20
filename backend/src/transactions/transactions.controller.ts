import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Post()
    create(@Body() transactionData: CreateTransactionDto) {
        return this.transactionsService.create(transactionData);
    }

    @Get()
    findAll(@Query('userId') userId?: string) {
        return this.transactionsService.findAll(userId || '00000000-0000-0000-0000-000000000001');
    }
}
