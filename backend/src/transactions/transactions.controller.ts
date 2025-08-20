import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Post()
    @ApiOperation({ 
        summary: 'Создать транзакцию пополнения (Payin)',
        description: 'Создает новую транзакцию пополнения баланса через DeCard API. Возвращает redirect_url для перехода на платежную форму.'
    })
    @ApiBody({ type: CreateTransactionDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Транзакция успешно создана',
        schema: {
            type: 'object',
            properties: {
                redirectUrl: { type: 'string', example: 'https://decard.me/payment/12345' },
                orderToken: { type: 'string', example: 'abc123-def456-ghi789' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные запроса' })
    @ApiResponse({ status: 500, description: 'Ошибка сервера или DeCard API' })
    create(@Body() transactionData: CreateTransactionDto) {
        return this.transactionsService.create(transactionData);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Получить список транзакций',
        description: 'Возвращает список всех транзакций пользователя (payin и payout)' 
    })
    @ApiQuery({ 
        name: 'userId', 
        required: false, 
        description: 'ID пользователя (по умолчанию: default user)',
        example: '00000000-0000-0000-0000-000000000001'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Список транзакций',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'uuid-transaction-id' },
                    type: { type: 'string', enum: ['PAYIN', 'PAYOUT'] },
                    provider: { type: 'string', example: 'decard' },
                    amountKopecks: { type: 'number', example: 10000 },
                    currency: { type: 'string', example: 'TRY' },
                    status: { type: 'string', enum: ['PENDING', 'PROGRESS', 'SUCCESS', 'FAILED'] },
                    paymentMethod: { type: 'string', example: 'card' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    findAll(@Query('userId') userId?: string) {
        return this.transactionsService.findAll(userId || '00000000-0000-0000-0000-000000000001');
    }
}
