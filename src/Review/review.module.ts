import { PrismaModule } from '@/Prisma/prisma.module';
import { AdminDeleteReviewAction } from '@/Review/actions/admin-delete-review.action';
import { AdminUpdateReviewAction } from '@/Review/actions/admin-update-review.action';
import { CreateReviewAction } from '@/Review/actions/create-review.action';
import { DeleteReviewAction } from '@/Review/actions/delete-review.action';
import { UpdateReviewAction } from '@/Review/actions/update-review.action';
import { AdminReviewController } from '@/Review/apis/admin-review.controller';
import { ReviewController } from '@/Review/apis/review.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController, AdminReviewController],
  providers: [
    CreateReviewAction,
    UpdateReviewAction,
    DeleteReviewAction,
    AdminUpdateReviewAction,
    AdminDeleteReviewAction
  ],
})
export class ReviewModule { }   