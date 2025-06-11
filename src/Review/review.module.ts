import { PrismaModule } from '@/Prisma/prisma.module';
import { CreateReviewAction } from '@/Review/actions/create-review.action';
import { DeleteReviewAction } from '@/Review/actions/delete-review.action';
import { UpdateReviewAction } from '@/Review/actions/update-review.action';
import { ReviewController } from '@/Review/apis/review.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController],
  providers: [CreateReviewAction, UpdateReviewAction, DeleteReviewAction],
})
export class ReviewModule { }   