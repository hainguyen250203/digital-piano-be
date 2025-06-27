import { NotificationService } from '@/notification/domain/notification.service';
import { UpdateOrderParams } from '@/Order/actions/update-order.params';
import { OrderQuery } from '@/Order/queries/order.query';
import { VerifyReturnUrlParams } from '@/Order/queries/params/verify-return-url.params';
import { PaymentQuery } from '@/Payment/queries/payment.query';
import { StockService } from '@/Stock/api/stock.service';
import { Injectable } from '@nestjs/common';
import { ChangeType, NotificationType, PaymentStatus, ReferenceType } from '@prisma/client';

@Injectable()
export class VerifyReturnUrlAction {
  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly paymentQuery: PaymentQuery,
    private readonly notificationService: NotificationService,
    private readonly stockService: StockService,
  ) { }

  async execute(params: VerifyReturnUrlParams) {
    const verifyReturnUrl = await this.paymentQuery.verifyReturnUrl(params);

    if (verifyReturnUrl.isSuccess) {
      const orderUpdated = await this.orderQuery.updateOrderIfUnpaid({
        id: params.vnp_TxnRef,
        paymentStatus: PaymentStatus.paid,
        paidAt: new Date(),
        transactionId: params.vnp_TransactionNo,
      });

      if (orderUpdated) {
        // Cập nhật kho sau khi thanh toán thành công
        const order = await this.orderQuery.getOrderById(orderUpdated.id);
        if (order) {
          for (const item of order.items) {
            await this.stockService.updateStock(
              item.productId,
              -item.quantity,
              ChangeType.sale,
              ReferenceType.order,
              order.id,
              `Trừ kho cho đơn hàng ${order.id} sau khi thanh toán thành công`,
            );
          }
        }

        await this.notificationService.sendNotificationAdminAndStaff(
          'Đơn hàng thành công',
          `Đơn hàng #${orderUpdated.id} đã được thanh toán thành công`,
          NotificationType.order
        );
      } else {
        return verifyReturnUrl;
      }

      return verifyReturnUrl;
    } else {
      const updateOrderParams: UpdateOrderParams = {
        id: verifyReturnUrl.vnp_TxnRef,
        paymentStatus: PaymentStatus.failed,
      };
      await this.orderQuery.updateOrder(updateOrderParams);
      return verifyReturnUrl;
    }
  }
}