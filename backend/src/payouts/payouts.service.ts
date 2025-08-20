import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionProvider, TransactionStatus, TransactionType } from '../transactions/entities/transaction.entity';
import { Repository } from 'typeorm';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { DecardService } from '../providers/decard/decard.service';

@Injectable()
export class PayoutsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        private readonly decardService: DecardService,
    ) {}

    async create(payoutData: CreatePayoutDto) {
        const newPayout = this.transactionsRepository.create({
            provider: payoutData.provider,
            amountKopecks: payoutData.amountKopecks,
            paymentMethod: payoutData.payoutMethod || 'papara', // Добавляем payment method
            currency: 'TRY', // Добавляем валюту
            type: TransactionType.PAYOUT,
            status: TransactionStatus.PENDING,
            userId: '00000000-0000-0000-0000-000000000001', // Используем дефолтного пользователя
        });
        await this.transactionsRepository.save(newPayout);

        if (payoutData.provider === TransactionProvider.DECARD) {
            // Используем метод из DTO или papara по умолчанию
            const payoutMethod = payoutData.payoutMethod || 'papara';
            const recipientName = payoutData.recipientName || 'Test User';
            
            const decardResponse = await this.decardService.createPayout({
                amount: newPayout.amountKopecks, // DeCard payout ожидает копейки напрямую
                currency: 'TRY',
                payoutMethod: payoutMethod,
                recipientDetails: {
                    fullName: recipientName,
                    userId: '00000000-0000-0000-0000-000000000001',
                    accountInfo: payoutData.paymentAccount
                },
                orderNumber: newPayout.id,
                callbackUrl: 'http://localhost:3001/webhook/decard',
            });

            console.log('DeCard Payout Response:', decardResponse);

            if (decardResponse.status === 'progress') {
                newPayout.status = TransactionStatus.PROGRESS;
                await this.transactionsRepository.save(newPayout);
            }

            return { status: newPayout.status, id: newPayout.id };
        }
        
        throw new Error(`Unsupported provider: ${payoutData.provider}`);
    }
}
