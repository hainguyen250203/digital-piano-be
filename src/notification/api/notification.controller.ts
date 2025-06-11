import { GetUser } from '@/Auth/decorators/user.decorator';
import { JwtAuthGuard } from '@/Auth/guards/jwt-auth.guard';
import { BaseResponseDto, SuccessResponseDto } from '@/Common/dto/base-response.dto';
import { ReqCreateNotificationDto } from '@/notification/api/dto/req-create-notification.dto';
import { ResNotificationDto } from '@/notification/api/dto/res-notification.dto';
import { NotificationService } from '@/notification/domain/notification.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller({ path: 'notifications', version: '1' })
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo thông báo mới' })
  @ApiResponse({
    status: 201,
    description: 'Thông báo đã được tạo thành công',
    type: ResNotificationDto
  })
  async create(
    @Body() dto: ReqCreateNotificationDto,
  ): Promise<BaseResponseDto<ResNotificationDto>> {
    const notification = await this.notificationService.create(dto);
    return new SuccessResponseDto('Tạo thông báo thành công', notification);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách thông báo',
    type: [ResNotificationDto]
  })
  async findAll(@GetUser('userId') userId: string): Promise<BaseResponseDto<ResNotificationDto[]>> {
    const notifications = await this.notificationService.findAllByUser(userId);
    return new SuccessResponseDto('Lấy danh sách thông báo thành công', notifications);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc' })
  @ApiResponse({
    status: 200,
    description: 'Số lượng thông báo chưa đọc',
    type: Number
  })
  async getUnreadCount(@GetUser('userId') userId: string): Promise<BaseResponseDto<number>> {
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    return new SuccessResponseDto('Lấy số lượng thông báo chưa đọc thành công', unreadCount);
  }

  @Patch(':id/mark-as-read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  @ApiResponse({
    status: 200,
    description: 'Thông báo đã được đánh dấu là đã đọc',
    type: ResNotificationDto
  })
  async markAsRead(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ): Promise<BaseResponseDto<ResNotificationDto>> {
    const notification = await this.notificationService.markAsRead(id, userId);
    return new SuccessResponseDto('Đánh dấu thông báo đã đọc thành công', notification);
  }

  @Patch('mark-all-as-read')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  @ApiResponse({
    status: 200,
    description: 'Tất cả thông báo đã được đánh dấu là đã đọc'
  })
  async markAllAsRead(@GetUser('userId') userId: string): Promise<BaseResponseDto<null>> {
    await this.notificationService.markAllAsRead(userId);
    return new SuccessResponseDto('Đánh dấu tất cả thông báo đã đọc thành công', null);
  }

  @Delete('read')
  @ApiOperation({ summary: 'Xóa tất cả thông báo đã đọc' })
  @ApiResponse({
    status: 200,
    description: 'Tất cả thông báo đã được xóa',
  })
  async deleteAllRead(@GetUser('userId') userId: string): Promise<BaseResponseDto<null>> {
    console.log('🚀 ~ NotificationController ~ deleteAllRead ~ userId:', userId)

    await this.notificationService.deleteAllRead(userId);
    return new SuccessResponseDto('Xóa tất cả thông báo đã đọc thành công', null);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  @ApiResponse({
    status: 200,
    description: 'Thông báo đã được xóa',
  })
  async delete(@Param('id') id: string): Promise<BaseResponseDto<null>> {
    await this.notificationService.deleteOne(id);
    return new SuccessResponseDto('Xóa thông báo thành công', null);
  }





} 