import { Roles } from '@/Auth/decorators/roles.decorator';
import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { CreateReviewAction } from '@/Review/actions/create-review.action';
import { DeleteReviewAction } from '@/Review/actions/delete-review.action';
import { UpdateReviewAction } from '@/Review/actions/update-review.action';
import { CreateReviewDto } from '@/Review/apis/dto/create-review.dto';
import { UpdateReviewDto } from '@/Review/apis/dto/update-review.dto';
import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@Controller({
  path: 'reviews',
  version: '1'
})
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(
    private readonly createReviewAction: CreateReviewAction,
    private readonly updateReviewAction: UpdateReviewAction,
    private readonly deleteReviewAction: DeleteReviewAction
  ) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đánh giá' })
  async createReview(@Body() createReviewDto: CreateReviewDto, @GetUser('userId') userId: string) {
    const data = await this.createReviewAction.execute(userId, createReviewDto);
    return new SuccessResponseDto('Tạo đánh giá thành công', data);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật đánh giá' })
  async updateReview(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @GetUser('userId') userId: string) {
    const data = await this.updateReviewAction.execute(userId, id, updateReviewDto);
    return new SuccessResponseDto('Cập nhật đánh giá thành công', data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa đánh giá' })
  async deleteReview(@Param('id') id: string, @GetUser('userId') userId: string) {
    const data = await this.deleteReviewAction.execute(userId, id);
    return new SuccessResponseDto('Xóa đánh giá thành công', data);
  }
}

@Controller({
  path: 'admin/reviews',
  version: '1'
})
@UseGuards(JwtAuthGuard, Roles)
@Roles(Role.admin)
export class AdminReviewController {
  private readonly SYSTEM_ADMIN_ID = 'system-admin';

  constructor(
    private readonly updateReviewAction: UpdateReviewAction,
    private readonly deleteReviewAction: DeleteReviewAction
  ) { }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật đánh giá' })
  async adminUpdateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    const data = await this.updateReviewAction.execute(this.SYSTEM_ADMIN_ID, id, updateReviewDto);
    return new SuccessResponseDto('Admin cập nhật đánh giá thành công', data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa đánh giá' })
  async adminDeleteReview(@Param('id') id: string) {
    const data = await this.deleteReviewAction.execute(this.SYSTEM_ADMIN_ID, id);
    return new SuccessResponseDto('Admin xóa đánh giá thành công', data);
  }
}