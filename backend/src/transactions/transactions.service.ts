import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionProvider, TransactionStatus } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DecardService } from '../providers/decard/decard.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        private readonly decardService: DecardService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {}

    async create(transactionData: CreateTransactionDto) {
        // Получаем валюту пользователя
        const userCurrency = await this.usersService.getUserCurrency(this.usersService.getDefaultUserId());
        
        const newTransaction = this.transactionsRepository.create({
            ...transactionData,
            currency: userCurrency, // Добавляем валюту пользователя
            userId: this.usersService.getDefaultUserId(), // Используем дефолтного пользователя
        });
        await this.transactionsRepository.save(newTransaction);
        
        console.log('Saved new transaction:', newTransaction);

        // Только DeCard
        if (newTransaction.provider === TransactionProvider.DECARD) {
            const decardResponse = await this.decardService.createPayin({
                amount: newTransaction.amountKopecks / 100, // Конвертируем копейки в лиры (DeCard service умножит на 100)
                currency: userCurrency,
                paymentMethod: newTransaction.paymentMethod || 'card',
                orderNumber: newTransaction.id,
                callbackUrl: this.configService.get<string>('DECARD_WEBHOOK_URL'),
                successUrl: this.configService.get<string>('PAYMENT_SUCCESS_URL'),
                failUrl: this.configService.get<string>('PAYMENT_FAIL_URL'),
                // Используем данные из DTO или дефолтные значения
                userDetails: {
                    firstName: transactionData.firstName || 'Test',
                    lastName: transactionData.lastName || 'User',
                    userId: transactionData.userId || this.usersService.getDefaultUserId()
                }
            });
            return { 
                redirectUrl: decardResponse.redirect_url,
                orderToken: decardResponse.order_token 
            };
        }

        throw new Error(`Unsupported provider: ${newTransaction.provider}`);
    }

    async findAll(userId: string) {
        const transactions = await this.transactionsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50 // Последние 50 транзакций
        });

        return transactions;
    }
}
