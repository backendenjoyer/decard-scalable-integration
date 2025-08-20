import { Body, Controller, Post, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) {}

    @Post('decard')
    @HttpCode(HttpStatus.OK)
    async handleDecardWebhook(@Body() payload: any, @Req() req: Request) {
        // Получаем IP клиента
        const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string || 'unknown';
        
        try {
            await this.webhookService.handleDecardWebhook(payload, clientIP);
            return { status: 'ok' };
        } catch (error) {
            console.error('[Webhook Controller] Error processing webhook:', error.message);
            throw error;
        }
    }
}
