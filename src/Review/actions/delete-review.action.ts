import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteReviewAction {
  constructor(private prisma: PrismaService) { }

  async execute(userId: string, reviewId: string): Promise<void> {
    // Check if review exists and belongs to user
    const review = await this.prisma.review.findFirst({
      where: {
        id: reviewId,
        userId: userId,
      },
    });

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại hoặc không thuộc về bạn');
    }

    // Delete review
    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
  }
} 