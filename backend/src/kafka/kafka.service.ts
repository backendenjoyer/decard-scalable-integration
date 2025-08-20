import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService {
    constructor(
        @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
    ) {}

    async onModuleInit() {
        // Backend только подключается к Kafka для отправки событий
        // События слушает event-worker, а не backend
        await this.kafkaClient.connect();
        console.log('[Backend] Kafka client connected for producing events');
    }

    emit(topic: string, message: any) {
        return this.kafkaClient.emit(topic, message);
    }
}
