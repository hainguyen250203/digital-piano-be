import { PrismaService } from '@/Prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminDeleteReviewAction {
  constructor(private prisma: PrismaService) { }

  async execute(adminId: string, reviewId: string): Promise<void> {
    // Check if review exists (admin can delete any review)
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    // Delete review
    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
  }
} 