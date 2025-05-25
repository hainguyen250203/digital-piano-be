import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReqCreateNotificationDto {

  @ApiPropertyOptional({
    description: 'ID của người dùng nhận thông báo',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Đơn hàng của bạn đã được xác nhận'
  })
  @IsString({ message: 'Tiêu đề phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiPropertyOptional({
    description: 'Nội dung thông báo',
    example: 'Đơn hàng #123 của bạn đã được xác nhận và đang được xử lý'
  })
  @IsString({ message: 'Nội dung phải là chuỗi ký tự' })
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Loại thông báo',
    enum: NotificationType,
    example: NotificationType.order
  })
  @IsEnum(NotificationType, { message: 'Loại thông báo không hợp lệ' })
  @IsOptional()
  type?: NotificationType;


} 
