import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventProcessingService } from './event-processing.service';

@Controller()
export class EventProcessingController {
    constructor(private readonly eventProcessingService: EventProcessingService) {}

    @MessagePattern('payment.webhook.decard')
    async handleDecardWebhook(@Payload() data: any) {
        console.log('[Event Worker] Received DeCard webhook event:', data.transactionId);
        return this.eventProcessingService.processDecardWebhook(data);
    }
}
