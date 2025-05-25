import { BuildPaymentParams } from "@/Payment/queries/params/buil-payment.params";
import { PrismaService } from "@/Prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VnpayService } from "nestjs-vnpay";
import { BuildPaymentUrl, ReturnQueryFromVNPay, dateFormat } from "vnpay";

@Injectable()
export class PaymentQuery {
  private readonly returnUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
  ) {
    this.returnUrl = this.configService.get('vnpay.returnUrl') as string;
  }
  async buildPaymentUrl(params: BuildPaymentParams) {
    const now = new Date();
    const expireDate = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
    const paymentParams: BuildPaymentUrl = {
      vnp_Amount: params.amount,
      vnp_OrderInfo: params.orderInfo,
      vnp_TxnRef: params.orderId,
      vnp_IpAddr: params.ipAddr,
      vnp_ReturnUrl: this.returnUrl,
      vnp_CreateDate: dateFormat(now),
      vnp_ExpireDate: dateFormat(expireDate),
    }
    console.log("🚀 ~ PaymentQuery ~ buildPaymentUrl ~ paymentParams:", paymentParams)
    const url = this.vnpayService.buildPaymentUrl(paymentParams);
    console.log("🚀 ~ PaymentQuery ~ buildPaymentUrl ~ url:", url)
    return url;
  }

  async verifyReturnUrl(params: ReturnQueryFromVNPay) {
    return await this.vnpayService.verifyReturnUrl(params);
  }

}
