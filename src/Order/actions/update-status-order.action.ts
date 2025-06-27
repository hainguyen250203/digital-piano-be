import { NotificationService } from '@/notification/domain/notification.service';
import { OrderQuery } from '@/Order/queries/order.query';
import { StockService } from '@/Stock/api/stock.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChangeType, NotificationType, OrderStatus, PaymentStatus, ReferenceType } from '@prisma/client';

@Injectable()
export class UpdateStatusOrderAction {
  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly stockService: StockService,
    private readonly notificationService: NotificationService,
  ) { }

  async execute(orderId: string, status: OrderStatus) {
    const order = await this.orderQuery.getOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    // Handle stock updates for cancelled orders
    if (status === OrderStatus.cancelled) {
      await this.handleCancelledOrderStock(order, orderId);
    }

    // Nếu giao hàng thành công thì cập nhật trạng thái thanh toán thành paid
    let updateData: any = { id: orderId, orderStatus: status };
    if (status === OrderStatus.delivered && order.paymentStatus !== PaymentStatus.paid) {
      updateData.paymentStatus = PaymentStatus.paid;
      updateData.paidAt = new Date();
    }

    // Update order status (và paymentStatus nếu cần)
    const updatedOrder = await this.orderQuery.updateOrder(updateData);

    // Create notification based on status
    await this.createStatusNotification(order.userId, orderId, status);

    return updatedOrder;
  }

  private async handleCancelledOrderStock(order: any, orderId: string) {
    for (const item of order.items) {
      await this.stockService.updateStock(
        item.productId,
        item.quantity,
        ChangeType.sale,
        ReferenceType.order,
        orderId,
        `Cancel order ${orderId}`
      );
    }
  }

  private async createStatusNotification(userId: string, orderId: string, status: OrderStatus) {
    const statusMessages = {
      [OrderStatus.cancelled]: `Đơn hàng ${orderId} đã được hủy`,
      [OrderStatus.processing]: `Đơn hàng ${orderId} đã được xử lý`,
      [OrderStatus.delivered]: `Đơn hàng ${orderId} đã được giao hàng`,
      [OrderStatus.returned]: `Đơn hàng ${orderId} đã được trả hàng`,
      [OrderStatus.pending]: `Đơn hàng ${orderId} đang chờ xử lý`,
    };

    const message = statusMessages[status] || `Đơn hàng ${orderId} đã cập nhật trạng thái`;

    await this.notificationService.create({
      userId,
      title: message,
      content: message,
      type: NotificationType.order,
    });
  }
}
