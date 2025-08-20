import { Controller, Get, Param, Query } from '@nestjs/common';
import { DecardService } from './decard/decard.service';
import { UsersService } from '../users/users.service';

@Controller('providers')
export class ProvidersController {
    constructor(
        private readonly decardService: DecardService,
        private readonly usersService: UsersService,
    ) {}

    @Get('decard/methods/:currency')
    async getDecardMethods(@Param('currency') currency: string) {
        try {
            const methods = await this.decardService.getAvailableMethods(currency);
            return {
                provider: 'decard',
                currency,
                methods,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Failed to get DeCard methods for ${currency}:`, error.message);
            return {
                provider: 'decard',
                currency,
                methods: [],
                error: 'Failed to fetch payment methods',
                timestamp: new Date().toISOString()
            };
        }
    }

    @Get('decard/methods')
    async getDecardMethodsForUser(@Query('userId') userId: string = '00000000-0000-0000-0000-000000000001') {
        try {
            const userCurrency = await this.usersService.getUserCurrency(userId);
            const methods = await this.decardService.getAvailableMethods(userCurrency);
            return {
                provider: 'decard',
                currency: userCurrency,
                methods,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Failed to get DeCard methods for user ${userId}:`, error.message);
            return {
                provider: 'decard',
                currency: 'TRY',
                methods: [],
                error: 'Failed to fetch payment methods',
                timestamp: new Date().toISOString()
            };
        }
    }

    @Get('supported-currencies')
    async getSupportedCurrencies() {
        return {
            currencies: [
                { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
                { code: 'USD', name: 'US Dollar', symbol: '$' },
                { code: 'EUR', name: 'Euro', symbol: '€' },
            ],
            timestamp: new Date().toISOString()
        };
    }
}
