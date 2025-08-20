import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionProvider } from '../entities/transaction.entity';

export class CreateTransactionDto {
    @IsEnum(TransactionProvider)
    provider: TransactionProvider;

    @IsNumber()
    @Min(1) // Минимум 1 копейка
    amountKopecks: number; // Сумма в копейках

    @IsString()
    paymentMethod: string; // card, papara, online_bank_transfer, etc.

    // Обязательные поля для TRY payment_method_details
    @IsOptional()
    @IsString()
    firstName?: string; // Имя плательщика

    @IsOptional()
    @IsString()
    lastName?: string; // Фамилия плательщика

    @IsOptional()
    @IsString()
    userId?: string; // ID пользователя в системе мерчанта
}
