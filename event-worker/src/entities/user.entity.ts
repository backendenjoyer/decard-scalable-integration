import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserCurrency {
    TRY = 'TRY',
    USD = 'USD',
    EUR = 'EUR',
}

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('bigint', { default: 0 })
    balanceKopecks: number; // Баланс в копейках (1 TRY = 100 копеек)

    @Column({
        type: 'enum',
        enum: UserCurrency,
        default: UserCurrency.TRY,
    })
    currency: UserCurrency;

    @Column({ default: 'Turkey' })
    country: string;

    @Column({ default: 'Istanbul' })
    city: string;

    @Column({ default: 'Europe/Istanbul' })
    timezone: string;
}
