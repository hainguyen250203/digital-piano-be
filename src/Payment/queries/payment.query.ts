import { BuildPaymentParams } from '@/Payment/queries/params/buil-payment.params';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from 'nestjs-vnpay';
import { BuildPaymentUrl, ReturnQueryFromVNPay } from 'vnpay';

// Dayjs for timezone handling
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class PaymentQuery {
  private readonly returnUrl: string;

  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
  ) {
    this.returnUrl = this.configService.get('vnpay.returnUrl') as string;
  }

  async buildPaymentUrl(params: BuildPaymentParams) {
    // Lấy thời gian theo giờ Việt Nam
    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const expireDate = now.add(15, 'minute');

    const paymentParams: BuildPaymentUrl = {
      vnp_Amount: params.amount,
      vnp_OrderInfo: params.orderInfo,
      vnp_TxnRef: params.orderId,
      vnp_IpAddr: params.ipAddr,
      vnp_ReturnUrl: this.returnUrl,
      vnp_CreateDate: parseInt(now.format('YYYYMMDDHHmmss')),
      vnp_ExpireDate: parseInt(expireDate.format('YYYYMMDDHHmmss')),
    };
    const url = this.vnpayService.buildPaymentUrl(paymentParams);
    return url;
  }

  async verifyReturnUrl(params: ReturnQueryFromVNPay) {
    return await this.vnpayService.verifyReturnUrl(params);
  }
}
