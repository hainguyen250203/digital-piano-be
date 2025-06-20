import { NotificationService } from '@/notification/domain/notification.service';
import { mapReturnStatusToVietnamese } from '@/ProductReturn/utils/return-status.mapper';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../Prisma/prisma.service';

@Injectable()
export class CancelProductReturnAction {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

  async execute(userId: string, returnId: string) {
    const productReturn = await this.prisma.productReturn.findUnique({
      where: { id: returnId },
      include: {
        order: { select: { userId: true } },
        orderItem: { include: { product: { select: { name: true, defaultImage: true } } } },
      },
    });
    if (!productReturn) throw new NotFoundException('Không tìm thấy yêu cầu trả hàng');
    if (productReturn.status !== 'PENDING') throw new BadRequestException('Chỉ có thể hủy yêu cầu trả hàng khi đang chờ xử lý');
    if (productReturn.order.userId !== userId) throw new BadRequestException('Bạn không có quyền hủy yêu cầu trả hàng này');
    const canceledReturn = await this.prisma.productReturn.update({
      where: { id: returnId },
      data: { status: 'REJECTED' },
      include: {
        orderItem: { include: { product: { select: { name: true, defaultImage: true } } } },
      },
    });
    // Gửi thông báo cho admin và staff
    const viStatus = mapReturnStatusToVietnamese(canceledReturn.status);
    await this.notificationService.sendNotificationAdminAndStaff(
      'Hủy yêu cầu trả hàng',
      `Yêu cầu trả hàng #${canceledReturn.id} cho sản phẩm "${canceledReturn.orderItem.product.name}" đã bị hủy bởi khách hàng (Trạng thái: ${viStatus})`,
      NotificationType.order
    );
    return canceledReturn;
  }
} 