import { PrismaService } from '@/Prisma/prisma.service';
import { ReviewResponseDto } from '@/Review/apis/dto/review-response.dto';
import { UpdateReviewDto } from '@/Review/apis/dto/update-review.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminUpdateReviewAction {
  constructor(private prisma: PrismaService) { }

  async execute(adminId: string, reviewId: string, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
    // Check if review exists (admin can update any review)
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
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