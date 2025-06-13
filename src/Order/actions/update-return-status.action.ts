import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReturnStatus } from '@prisma/client';
import { PrismaService } from '../../Prisma/prisma.service';
import { UpdateReturnStatusDto } from '../api/dto/update-return-status.dto';

@Injectable()
export class UpdateReturnStatusAction {
  constructor(private prisma: PrismaService) { }

  async execute(returnId: string, dto: UpdateReturnStatusDto) {
    // Get return request with order details
    const returnRequest = await this.prisma.productReturn.findUnique({
      where: { id: returnId },
      include: {
        order: true,
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    // Verify current status is not COMPLETED
    if (returnRequest.status === ReturnStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed return request');
    }

    // Update return request status
    const updatedReturn = await this.prisma.productReturn.update({
      where: { id: returnId },
      data: {
        status: dto.status,
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

    // If status is COMPLETED, update product stock
    if (dto.status === ReturnStatus.COMPLETED) {
      await this.prisma.stock.update({
        where: { productId: returnRequest.orderItem.productId },
        data: {
          quantity: {
            increment: returnRequest.quantity,
          },
        },
      });
    }

    return updatedReturn;
  }
} 