import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { TransactionProvider } from '../../transactions/entities/transaction.entity';

export class CreatePayoutDto {
    @IsEnum(TransactionProvider)
    provider: TransactionProvider;

    @IsNumber()
    amountKopecks: number; // Сумма в копейках

    @IsString()
    paymentAccount: string; // Papara номер или номер банковского счета

    @IsOptional()
    @IsString()
    payoutMethod?: 'papara' | 'bank-transfer'; // Метод вывода для TRY

    @IsOptional()
    @IsString()
    recipientName?: string; // Имя получателя
}
