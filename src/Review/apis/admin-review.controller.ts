import { Roles } from '@/Auth/decorators/roles.decorator';
import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/Auth/guards/roles.guard';
import { SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { AdminDeleteReviewAction } from '@/Review/actions/admin-delete-review.action';
import { AdminUpdateReviewAction } from '@/Review/actions/admin-update-review.action';
import { UpdateReviewDto } from '@/Review/apis/dto/update-review.dto';
import { Body, Controller, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('Admin - Reviews')
@Controller({
  path: 'admin/reviews',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminReviewController {
  constructor(
    private readonly adminUpdateReviewAction: AdminUpdateReviewAction,
    private readonly adminDeleteReviewAction: AdminDeleteReviewAction
  ) { }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin cập nhật đánh giá' })
  async adminUpdateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetUser('userId') userId: string
  ) {
    const data = await this.adminUpdateReviewAction.execute(userId, id, updateReviewDto);
    return new SuccessResponseDto('Admin cập nhật đánh giá thành công', data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin xóa đánh giá' })
  async adminDeleteReview(
    @Param('id') id: string,
    @GetUser('userId') userId: string
  ) {
    await this.adminDeleteReviewAction.execute(userId, id);
    return new SuccessResponseDto('Admin xóa đánh giá thành công', null);
  }
} 