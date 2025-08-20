import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { User } from './entities/user.entity';

@Injectable()
export class EventProcessingService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private dataSource: DataSource,
    ) {}

    async processDecardWebhook(data: any) {
        const { transactionId, status, amount, currency, type } = data;

        try {
            const transaction = await this.transactionsRepository.findOneBy({ id: transactionId });
            if (!transaction) {
                console.error(`[Event Worker] Transaction not found: ${transactionId}`);
                return;
            }

            // Обновляем статус транзакции
            if (status === 'success' && transaction.status !== TransactionStatus.COMPLETED) {
                transaction.status = TransactionStatus.COMPLETED;
                
                // Обновляем баланс пользователя атомарно (в копейках)
                await this.updateUserBalance(transaction.userId, transaction.amountKopecks);
                
                console.log(`[Event Worker] Transaction ${transactionId} completed, balance updated`);
            } else if (status === 'failed' && transaction.status !== TransactionStatus.FAILED) {
                transaction.status = TransactionStatus.FAILED;
                console.log(`[Event Worker] Transaction ${transactionId} failed`);
            }

            await this.transactionsRepository.save(transaction);
            
        } catch (error) {
            console.error(`[Event Worker] Error processing DeCard webhook for ${transactionId}:`, error.message);
            throw error;
        }
    }

    // Атомарное обновление баланса с правильными уровнями изоляции
    private async updateUserBalance(userId: string, amountKopecks: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        
        try {
            // Начинаем транзакцию с уровнем изоляции SERIALIZABLE
            await queryRunner.connect();
            await queryRunner.startTransaction('SERIALIZABLE');
            
            // Блокируем строку пользователя для обновления (SELECT ... FOR UPDATE)
            const user = await queryRunner.manager
                .createQueryBuilder(User, 'user')
                .setLock('pessimistic_write') // SELECT ... FOR UPDATE
                .where('user.id = :userId', { userId })
                .getOne();
            
            if (!user) {
                throw new Error(`User ${userId} not found`);
            }
            
            // Обновляем баланс атомарно (в копейках)
            const newBalanceKopecks = user.balanceKopecks + amountKopecks;
            
            // Проверяем, что баланс не станет отрицательным (для payout)
            if (newBalanceKopecks < 0) {
                throw new Error(`Insufficient balance for user ${userId}. Current: ${user.balanceKopecks} kopecks, Required: ${amountKopecks} kopecks`);
            }
            
            user.balanceKopecks = newBalanceKopecks;
            await queryRunner.manager.save(User, user);
            
            // Фиксируем транзакцию
            await queryRunner.commitTransaction();
            
            console.log(`[Event Worker] User ${userId} balance updated: ${user.balanceKopecks} + ${amountKopecks} = ${newBalanceKopecks} kopecks`);
            
        } catch (error) {
            // Откатываем транзакцию при ошибке
            await queryRunner.rollbackTransaction();
            console.error(`[Event Worker] Failed to update balance for user ${userId}:`, error.message);
            throw error;
        } finally {
            // Освобождаем ресурсы
            await queryRunner.release();
        }
    }
}
