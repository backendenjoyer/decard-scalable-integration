import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

@ApiTags('payouts')
@Controller('payouts')
export class PayoutsController {
    constructor(private readonly payoutsService: PayoutsService) {}

    @Post()
    @ApiOperation({ 
        summary: 'Создать заявку на вывод средств (Payout)',
        description: 'Создает новую заявку на вывод средств через DeCard API. Поддерживает Papara и банковские переводы.'
    })
    @ApiBody({ type: CreatePayoutDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Заявка на вывод успешно создана',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'PROGRESS' },
                id: { type: 'string', example: 'uuid-payout-id' },
                message: { type: 'string', example: 'Payout успешно инициирован' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные запроса или недостаточно средств' })
    @ApiResponse({ status: 500, description: 'Ошибка сервера или DeCard API' })
    create(@Body() payoutData: CreatePayoutDto) {
        return this.payoutsService.create(payoutData);
    }
}
