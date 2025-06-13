import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../Prisma/prisma.service';
import { CreateReturnRequestDto } from '../api/dto/create-return-request.dto';

@Injectable()
export class CreateReturnRequestAction {
  constructor(private prisma: PrismaService) { }

  async execute(userId: string, dto: CreateReturnRequestDto) {
    // Get order item with order details
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: dto.orderItemId },
      include: {
        order: true,
        product: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    // Verify order belongs to user
    if (orderItem.order.userId !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    // Verify order status is DELIVERED
    if (orderItem.order.orderStatus !== OrderStatus.delivered) {
      throw new BadRequestException('Can only return items from delivered orders');
    }

    // Verify return quantity is valid
    if (dto.quantity > orderItem.quantity) {
      throw new BadRequestException('Return quantity cannot exceed ordered quantity');
    }

    // Check if there's already a pending return request
    const existingReturn = await this.prisma.productReturn.findFirst({
      where: {
        orderItemId: dto.orderItemId,
        status: 'PENDING',
      },
    });

    if (existingReturn) {
      throw new BadRequestException('There is already a pending return request for this item');
    }

    // Create return request
    const returnRequest = await this.prisma.productReturn.create({
      data: {
        orderId: orderItem.orderId,
        orderItemId: orderItem.id,
        quantity: dto.quantity,
        reason: dto.reason,
        status: 'PENDING',
      },
      include: {
        order: true,
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });

    return returnRequest;
  }
} 