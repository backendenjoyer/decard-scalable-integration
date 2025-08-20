import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(':id/balance')
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
    async getUserCurrency(@Param('id') id: string) {
        const currency = await this.usersService.getUserCurrency(id);
        return { userId: id, currency };
    }
}
