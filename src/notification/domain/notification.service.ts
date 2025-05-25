import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { ReqCreateNotificationDto } from '../api/dto/req-create-notification.dto';
import { ResNotificationDto } from '../api/dto/res-notification.dto';
import { CreateNotificationAction } from './actions/create-notification.action';
import { FindAllByUserAction } from './actions/find-all-by-user.action';
import { GetUnreadCountAction } from './actions/get-unread-count.action';
import { MarkAllAsReadAction } from './actions/mark-all-as-read.action';
import { MarkAsReadAction } from './actions/mark-as-read.action';

@Injectable()
export class NotificationService {
  constructor(
    private readonly createNotificationAction: CreateNotificationAction,
    private readonly findAllByUserAction: FindAllByUserAction,
    private readonly getUnreadCountAction: GetUnreadCountAction,
    private readonly markAsReadAction: MarkAsReadAction,
    private readonly markAllAsReadAction: MarkAllAsReadAction,
    private readonly prisma: PrismaService,
  ) { }

  async create(dto: ReqCreateNotificationDto): Promise<ResNotificationDto> {
    return this.createNotificationAction.execute(dto);
  }

  async findAllByUser(userId: string): Promise<ResNotificationDto[]> {
    return this.findAllByUserAction.execute(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.getUnreadCountAction.execute(userId);
  }

  async markAsRead(id: string, userId: string): Promise<ResNotificationDto> {
    return this.markAsReadAction.execute(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.markAllAsReadAction.execute(userId);
  }

  async checkAlreadyNotified(orderId: string, type: NotificationType): Promise<boolean> {
    return await this.prisma.notification.findFirst({
      where: {
        content: { contains: `#${orderId}` },
        type,
      },
    }) != null;
  }

  async markNotified(orderId: string, type: NotificationType) {
    await this.prisma.notification.create({
      data: {
        title: 'Order Notification',
        content: `Order #${orderId} notification sent at ${new Date().toISOString()}`,
        type,
      },
    });
  }

  /**
   * Send notification to all staff and admin users
   */
  async sendNotificationAdminAndStaff(title: string, content: string, type: NotificationType) {
    const staffAndAdmins = await this.prisma.user.findMany({
      where: {
        role: { in: ['staff', 'admin'] },
        isDeleted: false
      },
      select: { id: true }
    });
    
    for (const user of staffAndAdmins) {
      await this.create({
        userId: user.id,
        title,
        content,
        type
      });
    }
  }

  /**
   * Send order status notification to a specific user
   */
  async sendOrderStatusNotification(userId: string, orderId: string, statusMessage: string, type: NotificationType = NotificationType.order) {
    const title = `Đơn hàng #${orderId}`;
    const content = statusMessage;
    
    return this.create({
      userId,
      title,
      content,
      type
    });
  }

  /**
   * Send order status notification to staff and admins
   */
  async notifyOrderToAdmins(orderId: string, statusMessage: string, amount?: number, type: NotificationType = NotificationType.order) {
    const title = `Đơn hàng #${orderId}`;
    const content = amount 
      ? `${statusMessage} với tổng tiền ${amount.toLocaleString('vi-VN')}đ`
      : statusMessage;
      
    return this.sendNotificationAdminAndStaff(title, content, type);
  }

  /**
   * Send payment notification
   */
  async notifyPaymentStatus(userId: string, orderId: string, isSuccess: boolean, type: NotificationType = NotificationType.order) {
    const statusMessage = isSuccess 
      ? `Đơn hàng #${orderId} đã được thanh toán thành công`
      : `Thanh toán đơn hàng #${orderId} thất bại`;
      
    await this.sendOrderStatusNotification(userId, orderId, statusMessage, type);
    
    // Also notify admins
    const adminMessage = isSuccess
      ? `Đơn hàng #${orderId} đã được thanh toán thành công`
      : `Thanh toán đơn hàng #${orderId} thất bại`;
      
    await this.sendNotificationAdminAndStaff(
      `Trạng thái thanh toán`,
      adminMessage,
      type
    );
  }
} 