import { OrderQuery } from "@/Order/queries/order.query";
import { NotificationService } from "@/notification/domain/notification.service";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

@Injectable()
export class UserChangePaymentMethodAction {
  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly notificationService: NotificationService,
  ) { }

  async execute(id: string, userId: string, paymentMethod: PaymentMethod) {
    // Validate order exists and belongs to user
    const order = await this.orderQuery.getOrderById(id);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thay đổi phương thức thanh toán cho đơn hàng này');
    }

    if (order.paymentMethod === paymentMethod) {
      throw new BadRequestException('Phương thức thanh toán phải khác với phương thức thanh toán hiện tại');
    }

    // Validate order status
    this.validateOrderStatus(order);

    // Update payment method
    const updatedOrder = await this.updatePaymentMethod(id, paymentMethod);
    if (!updatedOrder) {
      throw new BadRequestException('Không thể thay đổi phương thức thanh toán');
    }

    // Send notifications
    await this.sendNotifications(order);

    return updatedOrder;
  }

  private validateOrderStatus(order: any): void {
    if (order.orderStatus !== OrderStatus.pending) {
      throw new BadRequestException('Đơn hàng không ở trạng thái chờ xử lý');
    }
    if (order.paymentStatus !== PaymentStatus.unpaid) {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }
  }

  private async updatePaymentMethod(id: string, paymentMethod: PaymentMethod) {
    return this.orderQuery.updateOrder({
      id,
      paymentStatus: PaymentStatus.unpaid,
      paymentMethod,
    });
  }

  private async sendNotifications(order: any): Promise<void> {
    // Notify admins and staff
    await this.notificationService.sendNotificationAdminAndStaff(
      'Thay đổi phương thức thanh toán',
      `Đơn hàng #${order.id} đã được thay đổi phương thức thanh toán sang ${this.getPaymentMethodName(order.paymentMethod)}`,
      NotificationType.order
    );
  }

  private getPaymentMethodName(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.cash:
        return 'Thanh toán khi nhận hàng (COD)';
      case PaymentMethod.vnpay:
        return 'VNPay';
      default:
        return method;
    }
  }
} 