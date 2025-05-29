import { PrismaService } from '@/Prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from '../apis/dto/create-review.dto';
import { ReviewResponseDto } from '../apis/dto/review-response.dto';

@Injectable()
export class CreateReviewAction {
  constructor(private prisma: PrismaService) { }

  async execute(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Check if order item exists and belongs to user
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        id: dto.orderItemId,
        order: {
          userId: userId,
        },
      },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    // Check if order is delivered
    if (orderItem.order.orderStatus !== 'delivered') {
      throw new BadRequestException('Chỉ có thể đánh giá đơn hàng đã giao thành công');
    }

    // Check if user has already reviewed this product
    const existingProductReview = await this.prisma.review.findFirst({
      where: {
        userId: userId,
        productId: dto.productId,
        isDeleted: false,
      },
    });

    if (existingProductReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này trước đó');
    }

    // Check if review already exists for this order item
    const existingOrderItemReview = await this.prisma.review.findUnique({
      where: {
        orderItemId: dto.orderItemId,
      },
    });

    if (existingOrderItemReview && !existingOrderItemReview.isDeleted) {
      throw new BadRequestException('Đã có đánh giá cho đơn hàng này');
    }

    // If there's a soft-deleted review, update it instead of creating a new one
    if (existingOrderItemReview && existingOrderItemReview.isDeleted) {
      return await this.prisma.review.update({
        where: {
          id: existingOrderItemReview.id,
        },
        data: {
          rating: dto.rating,
          content: dto.content,
          isDeleted: false,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });
    }

    // Create review
    return await this.prisma.review.create({
      data: {
        userId: userId,
        productId: dto.productId,
        orderItemId: dto.orderItemId,
        rating: dto.rating,
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
} 