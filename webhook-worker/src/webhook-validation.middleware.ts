import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookValidationMiddleware implements NestMiddleware {
  private readonly decardAllowedIPs = [
    '13.49.167.214',
    '13.51.135.69', 
    '13.49.98.133',
    '13.50.69.248',
    '18.158.233.247',
    '13.51.235.85',
    '13.48.106.8'
  ];

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    const clientIP = this.getClientIP(req);

    console.log(`[Webhook Validation] ${req.method} ${path} from IP: ${clientIP}`);

    // Проверяем вебхуки DeCard
    if (path.includes('/webhook/decard')) {
      const isValidIP = this.decardAllowedIPs.includes(clientIP);
      if (!isValidIP && process.env.NODE_ENV === 'production') {
        console.error(`[Security] DeCard webhook from unauthorized IP: ${clientIP}`);
        throw new UnauthorizedException('Unauthorized IP address');
      }

      const isValidSignature = this.validateDecardSignature(req.body);
      if (!isValidSignature) {
        console.error('[Security] Invalid DeCard webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    next();
  }

  private validateDecardSignature(payload: any): boolean {
    const { sign, ...data } = payload;
    const shopSecret = this.configService.get<string>('DECARD_SHOP_SECRET');
    
    if (!shopSecret || !sign) {
      return false;
    }

    const signStr = Object.keys(data)
      .sort()
      .map(key => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      })
      .join('');

    const expectedSign = crypto
      .createHmac('sha256', shopSecret)
      .update(signStr)
      .digest('hex');

    return sign === expectedSign;
  }

  private getClientIP(req: Request): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           (req.connection as any)?.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.toString().split(',')[0] ||
           req.headers['x-real-ip']?.toString() ||
           'unknown';
  }
}
