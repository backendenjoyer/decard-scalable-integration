import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
    private kafka: Kafka;
    private producer: Producer;

    constructor(private readonly configService: ConfigService) {
        this.kafka = new Kafka({
            clientId: 'webhook-worker',
            brokers: [this.configService.get<string>('KAFKA_BROKER')],
            retry: {
                initialRetryTime: 100,
                retries: 10
            },
        });
        this.producer = this.kafka.producer({
            retry: {
                initialRetryTime: 100,
                retries: 10
            }
        });
    }

    async onModuleInit() {
        console.log('[Webhook Worker] Connecting to Kafka...');
        await this.producer.connect();
        console.log('[Webhook Worker] Kafka producer connected');
    }

    async emit(topic: string, message: any) {
        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: message.transactionId,
                        value: JSON.stringify(message),
                    },
                ],
            });
            console.log(`[Kafka] Sent message to topic ${topic}:`, message.transactionId);
        } catch (error) {
            console.error('[Kafka] Error sending message:', error);
            throw error;
        }
    }
}
