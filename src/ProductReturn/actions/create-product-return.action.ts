import { NotificationService } from '@/notification/domain/notification.service';
import { CreateProductReturnDto } from '@/ProductReturn/dto/create-product-return.dto';
import { mapReturnStatusToVietnamese } from '@/ProductReturn/utils/return-status.mapper';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, OrderStatus, ReturnStatus } from '@prisma/client';
import { PrismaService } from '../../Prisma/prisma.service';

@Injectable()
export class CreateProductReturnAction {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

  async execute(userId: string, orderId: string, dto: CreateProductReturnDto) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: dto.orderItemId },
      include: {
        order: { select: { id: true, userId: true, orderStatus: true } },
        product: { select: { name: true, defaultImage: true } },
        productReturns: true,
      },
    });
    if (!orderItem) throw new NotFoundException('Không tìm thấy sản phẩm trong đơn hàng này');
    if (orderItem.order.id !== orderId) throw new BadRequestException('Sản phẩm không thuộc về đơn hàng này');
    if (orderItem.order.userId !== userId) throw new BadRequestException('Đơn hàng không thuộc về người dùng');
    if (orderItem.order.orderStatus !== OrderStatus.delivered) throw new BadRequestException('Chỉ có thể trả hàng khi đơn đã giao thành công');
    if (dto.quantity > orderItem.quantity) throw new BadRequestException('Số lượng trả không được vượt quá số lượng đã mua');
    if (orderItem.productReturns.some(r => r.status === ReturnStatus.COMPLETED || r.status === ReturnStatus.REJECTED)) {
      throw new BadRequestException('Sản phẩm này đã có yêu cầu trả hàng đã hoàn thành hoặc bị từ chối, không thể tạo yêu cầu mới');
    }
    const existingReturn = orderItem.productReturns.find(r => r.status === ReturnStatus.PENDING);
    if (existingReturn) throw new BadRequestException('Đã tồn tại yêu cầu trả hàng đang chờ xử lý cho sản phẩm này');
    const productReturn = await this.prisma.productReturn.create({
      data: {
        orderId,
        orderItemId: orderItem.id,
        quantity: dto.quantity,
        reason: dto.reason,
        status: 'PENDING',
      },
      include: {
        orderItem: { include: { product: { select: { name: true, defaultImage: true } } } },
      },
    });

    // Gửi thông báo cho admin và staff
    const viStatus = mapReturnStatusToVietnamese(productReturn.status);
    await this.notificationService.sendNotificationAdminAndStaff(
      'Yêu cầu trả hàng mới',
      `Khách hàng vừa tạo yêu cầu trả hàng cho sản phẩm "${orderItem.product.name}" trong đơn #${orderId} (Trạng thái: ${viStatus})`,
      NotificationType.order
    );

    return productReturn;
  }
} 