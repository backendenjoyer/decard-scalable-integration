import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserCurrency } from './entities/user.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private dataSource: DataSource,
    ) {}

    // Метод для проверки баланса (только чтение)
    async getBalance(userId: string): Promise<number> {
        const user = await this.usersRepository.findOneBy({ id: userId });
        return user ? user.balanceKopecks : 0;
    }

    // Метод для получения баланса в лирах (для фронтенда)
    async getBalanceInLira(userId: string): Promise<number> {
        const kopecks = await this.getBalance(userId);
        return kopecks / 100; // Конвертируем копейки в лиры
    }

    // Метод для получения валюты пользователя
    async getUserCurrency(userId: string): Promise<UserCurrency> {
        const user = await this.usersRepository.findOneBy({ id: userId });
        return user ? user.currency : UserCurrency.TRY;
    }

    // Метод для создания пользователя (для сидинга)
    async createDefaultUser(): Promise<User> {
        // Используем фиксированный UUID для default пользователя
        const defaultUserId = '00000000-0000-0000-0000-000000000001';
        
        const existingUser = await this.usersRepository.findOneBy({ id: defaultUserId });
        if (existingUser) {
            return existingUser;
        }

        const newUser = this.usersRepository.create({
            id: defaultUserId,
            balanceKopecks: 0,
            currency: UserCurrency.TRY, // Захардкодим TRY для дефолтного пользователя
            country: 'Turkey',
            city: 'Istanbul',
            timezone: 'Europe/Istanbul',
        });

        return await this.usersRepository.save(newUser);
    }

    // Метод для получения ID дефолтного пользователя
    getDefaultUserId(): string {
        return '00000000-0000-0000-0000-000000000001';
    }

    // Метод для получения дефолтного пользователя
    async getDefaultUser(): Promise<User | null> {
        return await this.usersRepository.findOneBy({ id: this.getDefaultUserId() });
    }

    // Метод для определения валюты по геолокации
    determineCurrencyByLocation(country: string): UserCurrency {
        const currencyMap: Record<string, UserCurrency> = {
            'Turkey': UserCurrency.TRY,
            'United States': UserCurrency.USD,
            'Germany': UserCurrency.EUR,
            'France': UserCurrency.EUR,
            'Italy': UserCurrency.EUR,
            // Добавьте другие страны по необходимости
        };

        return currencyMap[country] || UserCurrency.TRY; // По умолчанию TRY
    }
}
