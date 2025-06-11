import { PrismaService } from '@/Prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from '../apis/dto/create-review.dto';
import { ReviewResponseDto } from '../apis/dto/review-response.dto';

// Enum cho mã lỗi
enum ReviewErrorCode {
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_NOT_DELIVERED = 'ORDER_NOT_DELIVERED',
  PRODUCT_ALREADY_REVIEWED = 'PRODUCT_ALREADY_REVIEWED',
  ORDER_ITEM_ALREADY_REVIEWED = 'ORDER_ITEM_ALREADY_REVIEWED',
}

@Injectable()
export class CreateReviewAction {
  constructor(private prisma: PrismaService) { }

  async execute(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    try {
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
        throw new NotFoundException({
          message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn',
          errorCode: ReviewErrorCode.ORDER_NOT_FOUND
        });
      }

      // Check if order is delivered
      if (orderItem.order.orderStatus !== 'delivered') {
        throw new BadRequestException({
          message: 'Chỉ có thể đánh giá đơn hàng đã giao thành công',
          errorCode: ReviewErrorCode.ORDER_NOT_DELIVERED
        });
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
        throw new BadRequestException({
          message: 'Bạn đã đánh giá sản phẩm này trước đó',
          errorCode: ReviewErrorCode.PRODUCT_ALREADY_REVIEWED
        });
      }

      // Check if review already exists for this order item
      const existingOrderItemReview = await this.prisma.review.findUnique({
        where: {
          orderItemId: dto.orderItemId,
        },
      });

      if (existingOrderItemReview && !existingOrderItemReview.isDeleted) {
        throw new BadRequestException({
          message: 'Đã có đánh giá cho đơn hàng này',
          errorCode: ReviewErrorCode.ORDER_ITEM_ALREADY_REVIEWED
        });
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

      });
    } catch (error) {
      // Đảm bảo rằng các lỗi từ Prisma được xử lý đúng
      if (error.code && error.code.startsWith('P')) {
        // Lỗi từ Prisma
        throw new BadRequestException({
          message: 'Lỗi dữ liệu: ' + error.message,
          errorCode: 'DATABASE_ERROR'
        });
      }
      // Truyền tiếp các lỗi đã được xử lý
      throw error;
    }
  }
} 