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

    @Column({ nullable: true })
    country: string; // Страна пользователя

    @Column({ nullable: true })
    city: string; // Город пользователя

    @Column({ nullable: true })
    timezone: string; // Часовой пояс
}
