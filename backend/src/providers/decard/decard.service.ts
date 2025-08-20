import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class DecardService {
    private readonly apiUrl: string;
    private readonly shopKey: string;
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
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiUrl = this.configService.get<string>('DECARD_API_URL');
        this.shopKey = this.configService.get<string>('DECARD_SHOP_KEY');
        this.shopSecret = this.configService.get<string>('DECARD_SHOP_SECRET');
    }

    private generateHash(data: Record<string, any>): string {
        // По документации DeCard: сортируем ключи и объединяем значения
        const signStr = Object.keys(data)
            .sort()
            .map(key => {
                const value = data[key];
                if (typeof value === 'object' && value !== null) {
                    // Для объектов используем JSON без пробелов
                    return JSON.stringify(value);
                }
                // Конвертируем всё в строку
                return String(value);
            })
            .join(''); // Объединяем без разделителей

        console.log('DeCard HMAC signature string:', signStr);
        
        const hash = crypto
            .createHmac('sha256', this.shopSecret)
            .update(signStr)
            .digest('hex');
            
        console.log('DeCard HMAC hash:', hash);
        return hash;
    }

    async getAvailableMethods(currency: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.apiUrl}/rest/paymentgate/methods/${currency}`)
            );
            return response.data;
        } catch (error) {
            console.error('DeCard Get Methods Error:', error.response?.data || error.message);
            throw new Error('Failed to get DeCard payment methods');
        }
    }

    validateWebhook(payload: DecardWebhookPayload, clientIP: string): boolean {
        // Проверяем IP
        if (!this.allowedIPs.includes(clientIP)) {
            console.error(`Webhook from unauthorized IP: ${clientIP}`);
            return false;
        }

        // Проверяем подпись
        const { sign, ...data } = payload;
        const expectedSign = this.generateHash(data);
        return sign === expectedSign;
    }

    async createPayin(transactionData: {
        amount: number;
        currency: string;
        paymentMethod: string;
        orderNumber: string;
        callbackUrl: string;
        successUrl: string;
        failUrl: string;
        userDetails?: {
            firstName: string;
            lastName: string;
            userId: string;
        };
    }) {
        // Валидация обязательных полей для payin
        if (!transactionData.amount || transactionData.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        if (!transactionData.orderNumber?.trim()) {
            throw new Error('Order number is required');
        }
        if (!transactionData.callbackUrl?.trim()) {
            throw new Error('Callback URL is required');
        }
        if (!transactionData.successUrl?.trim() || !transactionData.failUrl?.trim()) {
            throw new Error('Success and fail URLs are required');
        }

        const payload = {
            shop_key: this.shopKey,
            amount: Math.round(transactionData.amount * 100), // В минорных единицах
            order_currency: transactionData.currency,
            payment_currency: transactionData.currency,
            payment_method: transactionData.paymentMethod,
            order_number: transactionData.orderNumber,
            payment_details: `Payment for order ${transactionData.orderNumber}`,
            callback_url: transactionData.callbackUrl,
            success_url: transactionData.successUrl,
            fail_url: transactionData.failUrl,
            // Обязательные поля для TRY по документации DeCard
            payment_method_details: {
                first_name: transactionData.userDetails?.firstName || 'Test',
                last_name: transactionData.userDetails?.lastName || 'User', 
                user_id: transactionData.userDetails?.userId || '00000000-0000-0000-0000-000000000001'
            },
            lang: 'en'
        };

        const hash = this.generateHash(payload);
        
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.apiUrl}/rest/paymentgate/simple/`, payload, {
                    headers: {
                        'Api-sign': hash,
                        'Content-Type': 'application/json',
                    }
                })
            );
            return response.data;
        } catch (error) {
            console.error('DeCard API Error:', error.response?.data || error.message);
            throw new Error('Failed to create DeCard payin');
        }
    }

    async createPayout(payoutData: {
        amount: number; // В копейках
        currency: string;
        payoutMethod: 'papara' | 'bank-transfer';
        recipientDetails: {
            fullName: string;
            userId: string;
            // Для papara - номер, для bank-transfer - номер счета
            accountInfo: string;
        };
        orderNumber: string;
        callbackUrl: string;
    }) {
        // Валидация обязательных полей
        if (!payoutData.amount || payoutData.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        if (!payoutData.recipientDetails.fullName?.trim()) {
            throw new Error('Recipient full name is required');
        }
        if (!payoutData.recipientDetails.accountInfo?.trim()) {
            throw new Error('Account info (Papara number or bank account) is required');
        }
        if (!payoutData.orderNumber?.trim()) {
            throw new Error('Order number is required');
        }

        // Определяем endpoint и поля на основе метода
        let endpoint: string;
        let initPayload: any;

        if (payoutData.payoutMethod === 'papara') {
            endpoint = '/rest/payoutgate/papara/';
            initPayload = {
                shop_key: this.shopKey,
                amount: payoutData.amount,
                currency: payoutData.currency,
                order_number: payoutData.orderNumber, // Обязательное поле
                user_id: payoutData.recipientDetails.userId,
                recipient_full_name: payoutData.recipientDetails.fullName,
                number: payoutData.recipientDetails.accountInfo,
                callback_url: payoutData.callbackUrl // Для webhook уведомлений
            };
        } else if (payoutData.payoutMethod === 'bank-transfer') {
            endpoint = '/rest/payoutgate/bank-transfer/';
            initPayload = {
                shop_key: this.shopKey,
                amount: payoutData.amount,
                currency: payoutData.currency,
                order_number: payoutData.orderNumber, // Обязательное поле
                user_id: payoutData.recipientDetails.userId,
                recipient_full_name: payoutData.recipientDetails.fullName,
                account_number: payoutData.recipientDetails.accountInfo,
                callback_url: payoutData.callbackUrl // Для webhook уведомлений
            };
        } else {
            throw new Error(`Unsupported payout method: ${payoutData.payoutMethod}`);
        }

        const initHash = this.generateHash(initPayload);
        
        try {
            // Шаг 1: Инициализация payout
            const initResponse = await firstValueFrom(
                this.httpService.post(`${this.apiUrl}${endpoint}`, initPayload, {
                    headers: {
                        'Api-sign': initHash,
                        'Content-Type': 'application/json',
                    }
                })
            );

            const { order_token } = initResponse.data;

            // Шаг 2: Подтверждение payout
            const confirmPayload = {
                shop_key: this.shopKey,
                order_token: order_token,
            };

            const confirmHash = this.generateHash(confirmPayload);

            const confirmResponse = await firstValueFrom(
                this.httpService.put(`${this.apiUrl}/rest/payoutgate/confirm/`, confirmPayload, {
                    headers: {
                        'Api-sign': confirmHash,
                        'Content-Type': 'application/json',
                    }
                })
            );

            // Возвращаем детальную информацию о payout
            return {
                order_token: order_token,
                status: confirmResponse.data.status || 'progress',
                initResponse: initResponse.data,
                confirmResponse: confirmResponse.data
            };
        } catch (error) {
            console.error('DeCard Payout API Error:', {
                error: error.response?.data || error.message,
                status: error.response?.status,
                config: error.config
            });
            
            // Более информативная ошибка
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            const errorCode = error.response?.status || 'UNKNOWN';
            throw new Error(`DeCard Payout failed [${errorCode}]: ${errorMessage}`);
        }
    }
}

export interface DecardWebhookPayload {
    amount: number;
    currency: string;
    token: string;
    status: string;
    number: string; // наш order_number
    type: 'payment' | 'payout';
    sign: string;
    error_code?: string;
    error_message?: string;
}
