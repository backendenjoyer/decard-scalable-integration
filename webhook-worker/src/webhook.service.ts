import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
    private readonly shopSecret: string;
    private readonly allowedIPs = [
        '13.49.167.214',
        '13.51.135.69',
        '13.49.98.133',
        '13.50.69.248',
        '18.158.233.247',
        '13.51.235.85',
        '13.48.106.8'
    ];

    constructor(
        private readonly kafkaService: KafkaService,
        private readonly configService: ConfigService,
    ) {
        this.shopSecret = this.configService.get<string>('DECARD_SHOP_SECRET');
    }

    private generateHash(data: Record<string, any>): string {
        // Копируем логику из DeCard service
        const signStr = Object.keys(data)
            .sort()
            .map(key => {
                const value = data[key];
                if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value);
                }
                return String(value);
            })
            .join('');

        return crypto
            .createHmac('sha256', this.shopSecret)
            .update(signStr)
            .digest('hex');
    }

    validateWebhook(payload: any, clientIP: string): boolean {
        // 1. Проверяем IP
        if (!this.allowedIPs.includes(clientIP)) {
            console.error(`[Webhook Worker] Unauthorized IP: ${clientIP}`);
            return false;
        }

        // 2. Проверяем подпись
        const { sign, ...data } = payload;
        if (!sign) {
            console.error('[Webhook Worker] Missing signature in webhook');
            return false;
        }

        const expectedSign = this.generateHash(data);
        if (sign !== expectedSign) {
            console.error('[Webhook Worker] Invalid webhook signature');
            console.log('[Webhook Worker] Expected:', expectedSign);
            console.log('[Webhook Worker] Received:', sign);
            return false;
        }

        return true;
    }

    async handleDecardWebhook(payload: any, clientIP: string) {
        console.log('[Webhook Worker] Received DeCard webhook:', payload.number, 'from IP:', clientIP);
        
        // Валидируем webhook
        if (!this.validateWebhook(payload, clientIP)) {
            throw new Error('Webhook validation failed');
        }

        console.log('[Webhook Worker] Webhook validation passed');
        
        // Отправляем событие в Kafka для обработки основным воркером
        await this.kafkaService.emit('payment.webhook.decard', {
            provider: 'decard',
            transactionId: payload.number, // наш order_number
            status: payload.status,
            amount: payload.amount,
            currency: payload.currency,
            type: payload.type,
            timestamp: new Date().toISOString(),
            rawPayload: payload,
            validatedAt: new Date().toISOString(),
            clientIP: clientIP
        });

        console.log('[Webhook Worker] Event sent to Kafka for transaction:', payload.number);
    }
}
