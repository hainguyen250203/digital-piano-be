import { PrismaService } from '@/Prisma/prisma.service';
import { ReviewResponseDto } from '@/Review/apis/dto/review-response.dto';
import { UpdateReviewDto } from '@/Review/apis/dto/update-review.dto';
import { Injectable, NotFoundException } from '@nestjs/common';


@Injectable()
export class UpdateReviewAction {
  constructor(private prisma: PrismaService) { }

  async execute(userId: string, reviewId: string, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
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

    // Prepare update data
    const updateData: any = {};
    if (dto.rating !== undefined) {
      updateData.rating = dto.rating;
    }
    if (dto.content !== undefined) {
      updateData.content = dto.content;
    }
    updateData.updatedAt = new Date();

    // Update review
    return await this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: updateData,
    });
  }
} 