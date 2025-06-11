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
    console.warn('[VerifyReturnUrl] Starting verification with params:', {
      orderId: params.vnp_TxnRef,
      responseCode: params.vnp_ResponseCode,
      transactionStatus: params.vnp_TransactionStatus
    });

    const verifyReturnUrl = await this.paymentQuery.verifyReturnUrl(params);
    console.warn('[VerifyReturnUrl] Verification result:', {
      orderId: params.vnp_TxnRef,
      isSuccess: verifyReturnUrl.isSuccess,
      isVerified: verifyReturnUrl.isVerified
    });

    if (verifyReturnUrl.isSuccess) {
      console.warn('[VerifyReturnUrl] Updating order payment status:', params.vnp_TxnRef);
      const orderUpdated = await this.orderQuery.updateOrderIfUnpaid({
        id: params.vnp_TxnRef,
        paymentStatus: PaymentStatus.paid,
        paidAt: new Date(),
        transactionId: params.vnp_TransactionNo,
      });

      if (orderUpdated) {
        console.warn('[VerifyReturnUrl] Order updated successfully:', {
          orderId: orderUpdated.id,
          paymentStatus: orderUpdated.paymentStatus
        });

        // Cập nhật kho sau khi thanh toán thành công
        const order = await this.orderQuery.getOrderById(orderUpdated.id);
        if (order) {
          console.warn('[VerifyReturnUrl] Updating stock for order:', order.id);
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
        console.warn('[VerifyReturnUrl] Order already paid or update failed:', params.vnp_TxnRef);
        return verifyReturnUrl;
      }

      return verifyReturnUrl;
    } else {
      console.error('[VerifyReturnUrl] Payment verification failed:', {
        orderId: verifyReturnUrl.vnp_TxnRef,
        responseCode: params.vnp_ResponseCode,
        transactionStatus: params.vnp_TransactionStatus
      });

      const updateOrderParams: UpdateOrderParams = {
        id: verifyReturnUrl.vnp_TxnRef,
        paymentStatus: PaymentStatus.failed,
      };
      await this.orderQuery.updateOrder(updateOrderParams);
      return verifyReturnUrl;
    }
  }
}