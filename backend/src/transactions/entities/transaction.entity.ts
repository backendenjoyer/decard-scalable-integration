import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

export enum TransactionProvider {
    DECARD = 'decard',
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    PROGRESS = 'progress',
}

export enum TransactionType {
    PAYIN = 'payin',
    PAYOUT = 'payout',
}

@Entity({ name: 'transactions' })
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: TransactionProvider,
    })
    provider: TransactionProvider;

    @Column('bigint')
    amountKopecks: number; // Сумма в копейках (1 TRY = 100 копеек)

    @Column({ nullable: false })
    paymentMethod: string; // card, apple_pay, crypto, etc.

    @Column({ nullable: false })
    currency: string; // валюта

    @Column({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.PAYIN,
    })
    type: TransactionType;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @ManyToOne(() => User)
    user: User;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
