import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionProvider } from '../../transactions/entities/transaction.entity';

export class CreatePayoutDto {
    @ApiProperty({
        description: 'Платежный провайдер',
        enum: TransactionProvider,
        example: TransactionProvider.DECARD,
    })
    @IsEnum(TransactionProvider)
    provider: TransactionProvider;

    @ApiProperty({
        description: 'Сумма вывода в копейках (1 TRY = 100 копеек)',
        minimum: 1,
        example: 5000,
        type: 'integer',
    })
    @IsNumber()
    amountKopecks: number; // Сумма в копейках

    @ApiProperty({
        description: 'Номер счета получателя (Papara номер или IBAN)',
        example: '123456789',
    })
    @IsString()
    paymentAccount: string; // Papara номер или номер банковского счета

    @ApiPropertyOptional({
        description: 'Метод вывода для TRY валюты',
        enum: ['papara', 'bank-transfer'],
        example: 'papara',
    })
    @IsOptional()
    @IsString()
    payoutMethod?: 'papara' | 'bank-transfer'; // Метод вывода для TRY

    @ApiPropertyOptional({
        description: 'Полное имя получателя',
        example: 'Ahmet Yılmaz',
    })
    @IsOptional()
    @IsString()
    recipientName?: string; // Имя получателя
}
