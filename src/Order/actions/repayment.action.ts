import { NotificationService } from '@/notification/domain/notification.service';
import { OrderQuery } from '@/Order/queries/order.query';
import { BuildPaymentParams } from '@/Payment/queries/params/buil-payment.params';
import { PaymentQuery } from '@/Payment/queries/payment.query';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Interface for Order object with required properties
 */
interface OrderDetails {
  id: string;
  userId: string;
  orderTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
}

@Injectable()
export class RepaymentAction {
  private readonly logger = new Logger(RepaymentAction.name);

  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly paymentQuery: PaymentQuery,
    private readonly notificationService: NotificationService,
  ) { }


  async execute(orderId: string, ipAddr: string): Promise<{ paymentUrl: string }> {
    this.logger.log(`Processing repayment request for order ${orderId}`);

    // Get and validate order
    const order = await this.getAndValidateOrder(orderId);

    // Build payment URL
    const paymentUrl = await this.createPaymentUrl(order, ipAddr);

    return { paymentUrl };
  }

  private async getAndValidateOrder(orderId: string): Promise<OrderDetails> {
    const order = await this.orderQuery.getOrderById(orderId);

    if (!order) {
      this.logger.warn(`Order ${orderId} not found for repayment`);
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    // Check payment eligibility based on payment method
    if (order.paymentMethod === PaymentMethod.vnpay) {
      // For VNPAY, only allow repayment if the order is unpaid
      if (order.paymentStatus !== PaymentStatus.unpaid) {
        this.logger.warn(`Cannot repay order ${orderId} with payment status ${order.paymentStatus}`);
        throw new BadRequestException('Không thể thanh toán lại đơn hàng đã thanh toán');
      }
    } else {
      // For non-VNPAY methods, don't allow repayment
      this.logger.warn(`Cannot repay order ${orderId} with payment method ${order.paymentMethod}`);
      throw new BadRequestException('Chỉ có thể thanh toán lại đơn hàng sử dụng VNPAY');
    }

    return {
      ...order,
      orderTotal: Number(order.orderTotal),
    };
  }

  private async createPaymentUrl(order: OrderDetails, ipAddr: string): Promise<string> {
    this.logger.log(`Creating payment URL for order ${order.id}`);

    const buildPaymentParams: BuildPaymentParams = {
      amount: order.orderTotal,
      orderId: order.id,
      orderInfo: `Đơn hàng #${order.id}`,
      ipAddr: ipAddr,
    };

    return await this.paymentQuery.buildPaymentUrl(buildPaymentParams);
  }


}
