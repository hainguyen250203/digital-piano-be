import { NotificationService } from '@/notification/domain/notification.service';
import { OrderQuery } from '@/Order/queries/order.query';
import { StockService } from '@/Stock/api/stock.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChangeType, NotificationType, OrderStatus, ReferenceType } from '@prisma/client';

/**
 * Interface for order items
 */
interface OrderItem {
  productId: string;
  quantity: number;
}

/**
 * Action for handling order cancellation by admins
 */
@Injectable()
export class AdminCancelOrderAction {
  private readonly logger = new Logger(AdminCancelOrderAction.name);

  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly stockService: StockService,
    private readonly notificationService: NotificationService
  ) { }


  async execute(orderId: string) {
    this.logger.log(`Admin cancelling order ${orderId}`);

    // Get and validate order
    const order = await this.validateOrder(orderId);

    // Cancel the order
    const updatedOrder = await this.cancelOrder(orderId);

    // Update inventory
    await this.returnItemsToInventory(order.items, orderId);

    // Send notifications
    await this.sendCancellationNotifications(order.id, order.userId);

    return updatedOrder;
  }

  private async validateOrder(orderId: string) {
    const order = await this.orderQuery.getOrderById(orderId);

    if (!order) {
      this.logger.warn(`Order ${orderId} not found`);
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (order.orderStatus === OrderStatus.cancelled) {
      this.logger.warn(`Order ${orderId} is already cancelled`);
      throw new BadRequestException('Đơn hàng đã bị hủy trước đó');
    }

    return order;
  }

  private async cancelOrder(orderId: string) {
    this.logger.log(`Updating order ${orderId} status to cancelled`);
    return await this.orderQuery.updateOrder({
      id: orderId,
      orderStatus: OrderStatus.cancelled
    });
  }

  private async returnItemsToInventory(items: OrderItem[], orderId: string) {
    this.logger.log(`Returning items to inventory for order ${orderId}`);
    for (const item of items) {
      await this.stockService.updateStock(
        item.productId,
        item.quantity,
        ChangeType.sale,
        ReferenceType.order,
        orderId,
        `Hoàn trả kho cho đơn hàng ${orderId} đã bị hủy (bởi admin)`
      );
    }
  }

  /**
   * Send notifications about order cancellation
   * @param orderId Order ID
   * @param userId User ID
   */
  private async sendCancellationNotifications(orderId: string, userId: string) {
    this.logger.log(`Sending cancellation notifications for order ${orderId}`);
    // Notify user
    await this.notificationService.sendOrderStatusNotification(
      userId,
      orderId,
      'Đơn hàng đã bị hủy bởi quản trị viên',
      NotificationType.order
    );

  }
}