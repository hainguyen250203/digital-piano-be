import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class ResNotificationDto {
  @ApiProperty({
    description: 'ID của thông báo',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiPropertyOptional({
    description: 'ID của người dùng nhận thông báo',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId?: string;

  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Đơn hàng của bạn đã được xác nhận'
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Nội dung thông báo',
    example: 'Đơn hàng #123 của bạn đã được xác nhận và đang được xử lý'
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Loại thông báo',
    enum: NotificationType,
    example: NotificationType.order
  })
  type?: NotificationType;

  @ApiProperty({
    description: 'Trạng thái đã đọc',
    example: false
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-03-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2024-03-15T10:30:00Z'
  })
  updatedAt: Date;
} 