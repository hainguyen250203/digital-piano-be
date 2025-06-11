import { NotificationService } from '@/notification/domain/notification.service';
import { OrderQuery } from '@/Order/queries/order.query';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Order, OrderStatus, PaymentStatus } from '@prisma/client';

interface OrderUpdateParams {
  id: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}

@Injectable()
export class UserConfirmDeliveryAction {
  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly notificationService: NotificationService,
  ) { }

  async execute(id: string, userId: string): Promise<Order> {
    try {
      const order = await this.validateAndGetOrder(id, userId);
      const updatedOrder = await this.updateOrderStatus(order.id);
      await this.sendNotifications(updatedOrder);

      return updatedOrder;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async validateAndGetOrder(id: string, userId: string): Promise<Order> {
    const order = await this.orderQuery.getOrderById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You are not allowed to confirm delivery for this order');
    }

    this.validateOrderStatus(order.orderStatus);

    return order;
  }

  private validateOrderStatus(status: OrderStatus): void {
    if (status !== OrderStatus.shipping) {
      const statusMessages: Record<Exclude<OrderStatus, 'shipping'>, string> = {
        [OrderStatus.delivered]: 'Đơn hàng đã được giao thành công',
        [OrderStatus.cancelled]: 'Đơn hàng đã bị hủy',
        [OrderStatus.pending]: 'Đơn hàng đang chờ giao',
        [OrderStatus.processing]: 'Đơn hàng đang được xử lý',
        [OrderStatus.returned]: 'Đơn hàng đã được trả lại',
      };

      throw new BadRequestException(statusMessages[status] || 'Đơn hàng không thể xác nhận giao hàng');
    }
  }

  private async updateOrderStatus(orderId: string): Promise<Order> {
    const updateParams: OrderUpdateParams = {
      id: orderId,
      orderStatus: OrderStatus.delivered,
      paymentStatus: PaymentStatus.paid,
    };

    const updatedOrder = await this.orderQuery.updateOrder(updateParams);

    if (!updatedOrder) {
      throw new BadRequestException('Failed to confirm delivery');
    }

    return updatedOrder;
  }

  private async sendNotifications(order: Order): Promise<void> {
    const notificationTitle = 'Đơn hàng đã được xác nhận giao thành công';
    const notificationMessage = `Đơn hàng #${order.id} đã được xác nhận giao thành công`;

    await this.notificationService.sendNotificationAdminAndStaff(
      notificationTitle,
      notificationMessage,
      NotificationType.order
    );
  }

  private handleError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ForbiddenException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
    throw new BadRequestException('Failed to confirm delivery');
  }
} 