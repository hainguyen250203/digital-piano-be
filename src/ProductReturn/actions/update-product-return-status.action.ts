import { CreateNotificationAction } from '@/notification/domain/actions/create-notification.action';
import { NotificationService } from '@/notification/domain/notification.service';
import { PrismaService } from '@/Prisma/prisma.service';
import { UpdateProductReturnStatusDto } from '@/ProductReturn/dto/update-product-return-status.dto';
import { mapReturnStatusToVietnamese } from '@/ProductReturn/utils/return-status.mapper';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChangeType, NotificationType, ReferenceType, ReturnStatus } from '@prisma/client';

@Injectable()
export class UpdateProductReturnStatusAction {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private readonly createNotificationAction: CreateNotificationAction
  ) { }

  async execute(returnId: string, dto: UpdateProductReturnStatusDto) {
    const returnRequest = await this.prisma.productReturn.findUnique({
      where: { id: returnId },
      include: {
        orderItem: { include: { product: { select: { id: true, name: true, defaultImage: true } }, order: { select: { userId: true } } } },
      },
    });
    if (!returnRequest) throw new NotFoundException('Không tìm thấy yêu cầu trả hàng');
    if (returnRequest.status === ReturnStatus.COMPLETED) throw new BadRequestException('Không thể cập nhật yêu cầu trả hàng đã hoàn thành');
    const updatedReturn = await this.prisma.productReturn.update({
      where: { id: returnId },
      data: { status: dto.status },
      include: {
        orderItem: { include: { product: { select: { name: true, defaultImage: true } }, order: { select: { userId: true } } } },
      },
    });
    if (dto.status === ReturnStatus.COMPLETED) {
      await this.prisma.stock.update({
        where: { productId: updatedReturn.orderItem.productId },
        data: { quantity: { increment: updatedReturn.quantity } },
      });
      const stock = await this.prisma.stock.findUnique({ where: { productId: updatedReturn.orderItem.productId } });
      if (stock) {
        await this.prisma.stockLog.create({
          data: {
            stockId: stock.id,
            change: updatedReturn.quantity,
            changeType: ChangeType.return,
            referenceType: ReferenceType.product_return,
            referenceId: updatedReturn.id,
            note: `Hoàn trả sản phẩm từ yêu cầu trả hàng #${updatedReturn.id}`,
          },
        });
      }
    }
    // Gửi thông báo cho user
    const userId = updatedReturn.orderItem.order.userId;
    const viStatus = mapReturnStatusToVietnamese(updatedReturn.status);
    await this.createNotificationAction.execute({
      userId,
      title: 'Cập nhật trạng thái yêu cầu trả hàng',
      content: `Yêu cầu trả hàng #${updatedReturn.id} cho sản phẩm "${updatedReturn.orderItem.product.name}" đã được cập nhật trạng thái thành ${viStatus}`,
      type: NotificationType.order
    });
    return updatedReturn;
  }
} 