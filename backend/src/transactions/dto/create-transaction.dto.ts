import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider } from '../entities/transaction.entity';

export class CreateTransactionDto {
    @ApiProperty({
        description: 'Платежный провайдер',
        enum: TransactionProvider,
        example: TransactionProvider.DECARD,
    })
    @IsEnum(TransactionProvider)
    provider: TransactionProvider;

    @ApiProperty({
        description: 'Сумма пополнения в копейках (1 TRY = 100 копеек)',
        minimum: 1,
        example: 10000,
        type: 'integer',
    })
    @IsNumber()
    @Min(1) // Минимум 1 копейка
    amountKopecks: number; // Сумма в копейках

    @ApiProperty({
        description: 'Метод платежа',
        example: 'card',
        enum: ['card', 'papara', 'online_bank_transfer', 'apple_pay', 'google_pay'],
    })
    @IsString()
    paymentMethod: string; // card, papara, online_bank_transfer, etc.

    @ApiPropertyOptional({
        description: 'Имя плательщика (для TRY валюты)',
        example: 'Ahmet',
    })
    @IsOptional()
    @IsString()
    firstName?: string; // Имя плательщика

    @ApiPropertyOptional({
        description: 'Фамилия плательщика (для TRY валюты)',
        example: 'Yılmaz',
    })
    @IsOptional()
    @IsString()
    lastName?: string; // Фамилия плательщика

    @ApiPropertyOptional({
        description: 'ID пользователя в системе мерчанта',
        example: '00000000-0000-0000-0000-000000000001',
    })
    @IsOptional()
    @IsString()
    userId?: string; // ID пользователя в системе мерчанта
}
