import { NotificationService } from "@/notification/domain/notification.service";
import { OrderQuery } from "@/Order/queries/order.query";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, OrderStatus, PaymentStatus } from "@prisma/client";

@Injectable()
export class UserConfirmDeliveryAction {
  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly notificationService: NotificationService,
  ) { }

  async execute(id: string, userId: string) {
    // Validate order exists and belongs to user
    const order = await this.orderQuery.getOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You are not allowed to confirm delivery for this order');
    }

    // Validate order status
    this.validateOrderStatus(order.orderStatus);

    // Update order status
    const updatedOrder = await this.orderQuery.updateOrder({
      id,
      orderStatus: OrderStatus.delivered,
      paymentStatus: PaymentStatus.paid,
    });

    if (!updatedOrder) {
      throw new BadRequestException('Failed to confirm delivery');
    }

    // Send notifications
    await this.sendNotifications(updatedOrder);

    return updatedOrder;
  }

  private validateOrderStatus(status: OrderStatus) {
    if (status === OrderStatus.delivered) {
      throw new BadRequestException('Đơn hàng đã được giao thành công');
    }
    if (status === OrderStatus.cancelled) {
      throw new BadRequestException('Đơn hàng đã bị hủy');
    }
    if (status === OrderStatus.pending) {
      throw new BadRequestException('Đơn hàng đang chờ giao');
    }
  }

  private async sendNotifications(order: any) {

    // Notify admins and staff
    await this.notificationService.sendNotificationAdminAndStaff(
      'Đơn hàng đã được xác nhận giao thành công',
      `Đơn hàng #${order.id} đã được xác nhận giao thành công`,
      NotificationType.order
    );
  }
} 