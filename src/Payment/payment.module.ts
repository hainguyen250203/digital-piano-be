import { PaymentQuery } from '@/Payment/queries/payment.query';
import { PrismaModule } from '@/Prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { HashAlgorithm, ignoreLogger } from 'vnpay';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const tmnCode = configService.get('vnpay.tmnCode');
        const secureSecret = configService.get('vnpay.hashSecret');
        const vnpayHost = configService.get('vnpay.baseUrl');
        if (!tmnCode || !secureSecret || !vnpayHost) {
          throw new Error('VNPay configuration is missing required fields');
        }

        return {
          tmnCode,
          secureSecret,
          vnpayHost,
          testMode: true,
          hashAlgorithm: HashAlgorithm.SHA512,
          enableLog: true,
          loggerFn: ignoreLogger,
        };
      },
    })
  ],
  providers: [
    PaymentQuery,
  ],
  exports: [
    PaymentQuery,
  ],
})
export class PaymentModule { }