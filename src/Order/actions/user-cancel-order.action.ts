import { OrderQuery } from "@/Order/queries/order.query";
import { StockService } from "@/Stock/api/stock.service";
import { NotificationService } from "@/notification/domain/notification.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ChangeType, NotificationType, OrderStatus, PaymentStatus, ReferenceType } from "@prisma/client";

/**
 * Action for handling order cancellation initiated by users
 */
@Injectable()
export class UserCancelOrderAction {
  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly notificationService: NotificationService,
    private readonly stockService: StockService,
  ) { }

  async execute(orderId: string) {
    // Validate order exists and can be cancelled
    const order = await this.orderQuery.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng");
    }

    this.validateOrderCanBeCancelled(order);

    // Process the cancellation
    return this.processCancellation(order);
  }

  private validateOrderCanBeCancelled(order: any): void {
    if (order.orderStatus !== OrderStatus.pending) {
      throw new BadRequestException("Đơn hàng không thể hủy vì không ở trạng thái chờ xử lý");
    }

    if (order.paymentStatus !== PaymentStatus.unpaid) {
      throw new BadRequestException("Đơn hàng đã được thanh toán, không thể hủy");
    }
  }

  private async processCancellation(order: any) {
    // Update order status
    const updateParams = { id: order.id, orderStatus: OrderStatus.cancelled, paymentStatus: PaymentStatus.failed };
    const updatedOrder = await this.orderQuery.updateOrder(updateParams);

    // Update stock (return items to inventory)
    await this.handleCancelledOrderStock(order, order.id);

    // Send notifications
    await this.sendCancellationNotifications(order.id);

    return updatedOrder;
  }

  /**
   * Send notifications about order cancellation to user and admins
   */
  private async sendCancellationNotifications(orderId: string): Promise<void> {
    // Notify staff and admins
    await this.notificationService.sendNotificationAdminAndStaff(
      "Đơn hàng đã được hủy",
      `Đơn hàng #${orderId} đã được hủy`,
      NotificationType.order
    );
  }

  /**
   * Update stock when an order is cancelled (return items to inventory)
   */
  private async handleCancelledOrderStock(order: any, orderId: string): Promise<void> {
    for (const item of order.items) {
      await this.stockService.updateStock(
        item.productId,
        item.quantity,
        ChangeType.sale,
        ReferenceType.order,
        orderId,
        `Hoàn trả kho cho đơn hàng ${orderId} đã hủy`
      );
    }
  }
}
