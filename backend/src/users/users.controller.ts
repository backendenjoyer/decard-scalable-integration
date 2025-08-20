import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(':id/balance')
    @ApiOperation({ 
        summary: 'Получить баланс пользователя',
        description: 'Возвращает текущий баланс пользователя в копейках и основной валюте'
    })
    @ApiParam({ name: 'id', description: 'ID пользователя', example: '00000000-0000-0000-0000-000000000001' })
    @ApiResponse({ 
        status: 200, 
        description: 'Баланс пользователя',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
                balanceKopecks: { type: 'number', example: 15000 },
                balanceLira: { type: 'number', example: 150.00 },
                currency: { type: 'string', example: 'TRY' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async getBalance(@Param('id') id: string) {
        const balanceKopecks = await this.usersService.getBalance(id);
        const userCurrency = await this.usersService.getUserCurrency(id);
        
        return { 
            userId: id, 
            balanceKopecks,
            balanceLira: balanceKopecks / 100, // Для удобства фронтенда
            currency: userCurrency
        };
    }

    @Get('default')
    @ApiOperation({ 
        summary: 'Получить данные дефолтного пользователя',
        description: 'Возвращает полную информацию о дефолтном тестовом пользователе'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Данные дефолтного пользователя',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
                balanceKopecks: { type: 'number', example: 0 },
                balanceLira: { type: 'number', example: 0.00 },
                currency: { type: 'string', example: 'TRY' },
                country: { type: 'string', example: 'Turkey' },
                city: { type: 'string', example: 'Istanbul' },
                timezone: { type: 'string', example: 'Europe/Istanbul' }
            }
        }
    })
    async getDefaultUser() {
        const user = await this.usersService.createDefaultUser();
        return { 
            userId: user.id, 
            balanceKopecks: user.balanceKopecks,
            balanceLira: user.balanceKopecks / 100,
            currency: user.currency,
            country: user.country,
            city: user.city,
            timezone: user.timezone
        };
    }

    @Get(':id/currency')
    @ApiOperation({ 
        summary: 'Получить валюту пользователя',
        description: 'Возвращает валюту пользователя (определяется по геолокации)'
    })
    @ApiParam({ name: 'id', description: 'ID пользователя', example: '00000000-0000-0000-0000-000000000001' })
    @ApiResponse({ 
        status: 200, 
        description: 'Валюта пользователя',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
                currency: { type: 'string', example: 'TRY' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async getUserCurrency(@Param('id') id: string) {
        const currency = await this.usersService.getUserCurrency(id);
        return { userId: id, currency };
    }
}
