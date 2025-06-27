import { OrderQuery } from '@/Order/queries/order.query';
import { NotificationService } from '@/notification/domain/notification.service';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Order, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

interface OrderUpdateParams {
  id: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
}

interface PaymentMethodInfo {
  name: string;
  description: string;
}

@Injectable()
export class UserChangePaymentMethodAction {
  private readonly paymentMethodInfo: Record<PaymentMethod, PaymentMethodInfo> = {
    [PaymentMethod.cash]: {
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán khi nhận hàng (COD)',
    },
    [PaymentMethod.vnpay]: {
      name: 'VNPay',
      description: 'Thanh toán qua VNPay',
    },
  };

  constructor(
    private readonly orderQuery: OrderQuery,
    private readonly notificationService: NotificationService,
  ) { }

  async execute(id: string, userId: string, paymentMethod: PaymentMethod): Promise<Order> {
    try {
      const order = await this.validateAndGetOrder(id, userId, paymentMethod);
      const updatedOrder = await this.updatePaymentMethod(order.id, paymentMethod);
      await this.sendNotifications(updatedOrder);

      return updatedOrder;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async validateAndGetOrder(
    id: string,
    userId: string,
    newPaymentMethod: PaymentMethod,
  ): Promise<Order> {
    const order = await this.orderQuery.getOrderById(id);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền thay đổi phương thức thanh toán cho đơn hàng này');
    }

    if (order.paymentMethod === newPaymentMethod) {
      throw new BadRequestException('Phương thức thanh toán phải khác với phương thức thanh toán hiện tại');
    }

    this.validateOrderStatus(order);

    return order;
  }

  private validateOrderStatus(order: Order): void {
    const validationErrors: Record<string, string> = {
      [OrderStatus.pending]: '',
      [PaymentStatus.unpaid]: '',
    };

    if (order.orderStatus !== OrderStatus.pending) {
      validationErrors[OrderStatus.pending] = 'Đơn hàng không ở trạng thái chờ xử lý';
    }

    if (order.paymentStatus !== PaymentStatus.unpaid) {
      validationErrors[PaymentStatus.unpaid] = 'Đơn hàng đã được thanh toán';
    }

    const errorMessage = Object.values(validationErrors).filter(Boolean).join(', ');
    if (errorMessage) {
      throw new BadRequestException(errorMessage);
    }
  }

  private async updatePaymentMethod(
    id: string,
    paymentMethod: PaymentMethod,
  ): Promise<Order> {
    const updateParams: OrderUpdateParams = {
      id,
      paymentStatus: PaymentStatus.unpaid,
      paymentMethod,
    };

    const updatedOrder = await this.orderQuery.updateOrder(updateParams);
    if (!updatedOrder) {
      throw new BadRequestException('Không thể thay đổi phương thức thanh toán');
    }

    return updatedOrder;
  }

  private async sendNotifications(order: Order): Promise<void> {
    const paymentMethodInfo = this.paymentMethodInfo[order.paymentMethod];
    const notificationTitle = 'Thay đổi phương thức thanh toán';
    const notificationMessage = `Đơn hàng #${order.id} đã được thay đổi phương thức thanh toán sang ${paymentMethodInfo.description}`;

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
    throw new BadRequestException('Không thể thay đổi phương thức thanh toán');
  }
} 